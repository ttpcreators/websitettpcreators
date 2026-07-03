import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import Reveal from './Reveal.jsx'
import { STATS } from '../data.js'

// Compteur animé (ease-out cubic) déclenché à l'entrée dans le viewport.
function Counter({ target, prefix = '', suffix = '', pad = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target)
      return
    }
    let start = null
    let raf
    const step = (ts) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / 1500, 1)
      setVal(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])

  let num = String(Math.round(val))
  while (num.length < pad) num = `0${num}`
  return (
    <span ref={ref}>
      {prefix}
      {num}
      {suffix}
    </span>
  )
}

export default function Stats() {
  return (
    <section className="sec sec-tight" aria-label="Chiffres clés">
      <div className="wrap">
        <Reveal className="stats">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat-n">
                <Counter target={s.target} prefix={s.prefix} suffix={s.suffix} pad={s.pad} />
              </div>
              <div className="stat-l">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
