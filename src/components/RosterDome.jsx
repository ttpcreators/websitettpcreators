import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useOnScreen } from '../lib/onScreen.js'

// Dôme du roster : une grille sans fin de cartes créateurs posée sur une sphère
// (les bords fuient vers l'arrière). On la fait glisser à la souris, au doigt ou
// au trackpad ; elle dérive doucement toute seule. CSS 3D uniquement (pas de
// WebGL), et la boucle s'arrête dès que le dôme sort de l'écran.

const mod = (a, n) => ((a % n) + n) % n

const PLATFORM = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' }

function sizes(cw) {
  return cw < 700 ? { W: 216, H: 284 } : { W: 300, H: 378 }
}

export default function RosterDome({ creators }) {
  const reduce = useReducedMotion()
  const [setOnScreenEl, on] = useOnScreen('120px')
  const boxRef = useRef(null)
  const stageRef = useRef(null)
  const [dims, setDims] = useState({ cw: 1200, ch: 700 })
  const [cStart, setCStart] = useState(-4)

  const st = useRef({ px: 0, vel: 0, drag: false, lastX: 0, lastT: 0, moved: 0 })

  const { W, H } = sizes(dims.cw)
  const rows = Math.ceil(dims.ch / H) + 1
  const slots = Math.ceil(dims.cw / W) + 4
  const n = creators.length

  // taille du dôme
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setDims({ cw: Math.round(width), ch: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // place chaque carte sur la sphère (appelé à chaque image)
  const layout = () => {
    const stage = stageRef.current
    if (!stage) return
    const { px } = st.current
    const Rx = Math.max(dims.cw * 0.78, 520)
    const Ry = Math.max(dims.ch * 1.05, 520)
    const first = Math.floor((-dims.cw / 2 - px) / W) - 1
    if (first !== cStartRef.current) {
      cStartRef.current = first
      setCStart(first)
    }
    for (const el of stage.children) {
      const c = +el.dataset.c
      const r = +el.dataset.r
      const x = c * W + px
      const y = (r - (rows - 1) / 2) * H
      const a = x / Rx
      const b = y / Ry
      if (Math.abs(a) > 1.35) {
        el.style.visibility = 'hidden'
        continue
      }
      el.style.visibility = ''
      const tx = Rx * Math.sin(a)
      const ty = Ry * Math.sin(b)
      const tz = -(Rx * (1 - Math.cos(a)) + Ry * (1 - Math.cos(b)))
      el.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,${tz.toFixed(1)}px) rotateY(${a.toFixed(4)}rad) rotateX(${(-b).toFixed(4)}rad)`
    }
  }
  const cStartRef = useRef(cStart)
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  // boucle d'animation : inertie + dérive lente, seulement quand le dôme est visible
  useEffect(() => {
    layoutRef.current()
    if (!on) return
    const drift = reduce ? 0 : -0.35
    let raf
    const tick = () => {
      const s = st.current
      if (!s.drag) {
        s.vel += (drift - s.vel) * 0.04
        s.px += s.vel
      }
      layoutRef.current()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on, reduce])

  // après chaque rendu (nouvelles colonnes, redimensionnement), replacer tout de suite
  useEffect(() => {
    layoutRef.current()
  })

  // trackpad / molette horizontale
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      st.current.px -= e.deltaX
      st.current.vel = -e.deltaX * 0.15
      layoutRef.current()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e) => {
    const s = st.current
    s.drag = true
    s.moved = 0
    s.lastX = e.clientX
    s.lastT = performance.now()
    s.vel = 0
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    const s = st.current
    if (!s.drag) return
    const dx = e.clientX - s.lastX
    const now = performance.now()
    s.px += dx
    s.moved += Math.abs(dx)
    s.vel = (dx / Math.max(now - s.lastT, 1)) * 16
    s.lastX = e.clientX
    s.lastT = now
    if (!on) layoutRef.current()
  }
  const onPointerUp = (e) => {
    st.current.drag = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }
  // un glisser ne doit pas ouvrir le media kit
  const onClickCapture = (e) => {
    if (st.current.moved > 6) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const cells = []
  if (n) {
    for (let c = cStart; c < cStart + slots; c++) {
      for (let r = 0; r < rows; r++) {
        const p = creators[mod(c * rows + r, n)]
        // carte cliquable seulement si le media kit existe (adresse connue)
        const Tag = p.slug ? 'a' : 'div'
        const link = p.slug
          ? { href: `/mediakit/${p.slug}/`, 'aria-label': `${p.name}, voir son media kit` }
          : {}
        cells.push(
          <Tag
            key={`${c}:${r}`}
            data-c={c}
            data-r={r}
            className="dome-cell"
            style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2 }}
            draggable={false}
            {...link}
          >
            <span className="dome-top">
              <span>{p.handle}</span>
              <span>{p.niche}</span>
            </span>
            <span className="dome-img">
              {p.photo ? <img src={p.photo} alt="" draggable={false} /> : null}
            </span>
            <span className="dome-bot">
              <span className="dome-tags">
                <i>{PLATFORM[(p.platform || '').toLowerCase()] || 'Instagram'}</i>
                {p.slug ? <i>Media kit</i> : null}
              </span>
              <span className="dome-name">{p.name}</span>
            </span>
          </Tag>,
        )
      }
    }
  }

  return (
    <div
      className="dome"
      ref={(el) => {
        boxRef.current = el
        setOnScreenEl(el)
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      <div className="dome-stage" ref={stageRef}>
        {cells}
      </div>
    </div>
  )
}
