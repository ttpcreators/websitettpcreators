import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, PerformanceMonitor, RoundedBox, SoftShadows, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

// Le studio TTP en 3D : une pièce blanche baignée de soleil (ombre de fenêtre
// projetée sur le mur), un sol qui reflète, une étagère métallique avec les
// créateurs encadrés et des objets sport & lifestyle. Tout est construit en code
// (pas de modèle à télécharger) pour rester léger.
// Unités : mètres. Le mur est à z = -0.45, le devant de l'étagère à z = 0.

const WALL = '#eceae5'
const FLOOR = '#dcd9d3'
const METAL = { color: '#c9c9c6', metalness: 0.8, roughness: 0.42 }
const ACCENT = '#3d0000'
const INK = '#141416'

// étagère : trois travées
const BAYS = [
  { x: -1.4, w: 0.9, levels: [0.06, 0.44, 0.82, 1.2] },
  { x: -0.48, w: 1.3, levels: [0.06, 0.5, 0.94] },
  { x: 0.84, w: 0.56, levels: [0.06, 0.5, 0.94] },
]
const DEPTH = 0.36
const ROW = { y: 0.506, cx: 0.17, half: 0.6, step: 0.255 } // rangée des créateurs (travée du milieu)
const FRAME = { w: 0.195, h: 0.26 }

/* ── utilitaires ──────────────────────────────────────── */

const damp = THREE.MathUtils.damp

// Téléphone ou petit écran : rendu allégé (ombres, reflet, lissage) pour rester fluide
const LITE =
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 820px)').matches || (navigator.hardwareConcurrency || 8) <= 4)
const PORTRAIT = typeof window !== 'undefined' && window.matchMedia('(max-aspect-ratio: 4/5)').matches

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  draw(ctx, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  t.userData.redraw = (fn) => {
    fn(ctx, w, h)
    t.needsUpdate = true
  }
  return t
}

// Grain et matières : de petites textures dessinées une fois (bruit, plâtre,
// métal brossé, toile) pour casser l'aspect « plastique lisse ».
let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const TEX = {}
function grain(name, { size = 256, base = 128, amp = 46, streak = false, repeat = [1, 1], data = true } = {}) {
  if (TEX[name]) return TEX[name]
  const t = canvasTexture(size, size, (ctx, w, h) => {
    const img = ctx.createImageData(w, h)
    for (let y = 0; y < h; y++) {
      const row = rnd() - 0.5
      for (let x = 0; x < w; x++) {
        const n = streak ? row * amp + (rnd() - 0.5) * amp * 0.35 : (rnd() - 0.5) * amp
        const v = Math.max(0, Math.min(255, base + n))
        const i = (y * w + x) * 4
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    // taches douces (plâtre, béton)
    if (!streak) {
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle = `rgba(${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},0,0)`
        const g = ctx.createRadialGradient(rnd() * w, rnd() * h, 0, rnd() * w, rnd() * h, w * (0.1 + rnd() * 0.25))
        const a = 0.05 + rnd() * 0.06
        g.addColorStop(0, `rgba(${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},${a})`)
        g.addColorStop(1, 'rgba(128,128,128,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }
    }
  })
  if (data) t.colorSpace = THREE.NoColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  TEX[name] = t
  return t
}

// tranche de livre : couleur, bandes, petit titre
function spine(color, i) {
  const key = `spine-${color}-${i}`
  if (TEX[key]) return TEX[key]
  const dark = new THREE.Color(color).getHSL({}).l < 0.45
  const t = canvasTexture(64, 512, (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    for (let k = 0; k < 2200; k++) {
      ctx.fillStyle = `rgba(${dark ? 255 : 0},${dark ? 255 : 0},${dark ? 255 : 0},${rnd() * 0.05})`
      ctx.fillRect(rnd() * w, rnd() * h, 1, 2)
    }
    const ink = dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)'
    ctx.fillStyle = ink
    const style = i % 3
    if (style === 0) {
      ctx.fillRect(0, 40, w, 3)
      ctx.fillRect(0, h - 46, w, 3)
    } else if (style === 1) {
      ctx.fillRect(w * 0.2, 70, w * 0.6, 120)
    }
    ctx.fillRect(w * 0.35, h * 0.55, w * 0.3, h * 0.25)
  })
  TEX[key] = t
  return t
}

// Cadrage doux d'une photo dans son cadre 3:4 : une photo très en hauteur
// n'est plus recadrée sur le visage, elle s'affiche plus étroite avec un
// passe-partout blanc de chaque côté (comme un vrai tirage). On ne coupe
// jamais plus d'environ un quart de l'image.
function framed(tex) {
  const img = tex.image
  const fa = FRAME.w / FRAME.h
  const ia = img?.width ? img.width / img.height : fa
  const pa = Math.min(fa, Math.max(ia * 1.25, fa * 0.62)) // proportion de la photo affichée
  tex.userData.widthScale = pa / fa
  cover(tex, pa)
}

// recadre une photo pour remplir un cadre (comme object-fit: cover)
function cover(tex, aspect) {
  const img = tex.image
  if (!img?.width) return
  const ia = img.width / img.height
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  if (ia > aspect) {
    tex.repeat.set(aspect / ia, 1)
    tex.offset.set((1 - aspect / ia) / 2, 0)
  } else {
    tex.repeat.set(1, ia / aspect)
    tex.offset.set(0, (1 - ia / aspect) * 0.55) // un peu au-dessus du centre
  }
  tex.needsUpdate = true
}

function usePhotoTextures(creators) {
  const [texs, setTexs] = useState({})
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    let alive = true
    creators.forEach((c) => {
      if (!c.photo || texs[c.photo]) return
      loader.load(
        c.photo,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace
          t.anisotropy = 8
          framed(t)
          if (alive) setTexs((m) => ({ ...m, [c.photo]: t }))
        },
        undefined,
        () => {
          // version réduite indisponible : on charge l'original
          if (!c.photoFull || c.photoFull === c.photo) return
          loader.load(c.photoFull, (t) => {
            t.colorSpace = THREE.SRGBColorSpace
            framed(t)
            if (alive) setTexs((m) => ({ ...m, [c.photo]: t }))
          })
        },
      )
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creators])
  return texs
}

function useHoverCursor() {
  const [hover, setHover] = useState(false)
  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hover])
  return {
    hover,
    bind: {
      onPointerOver: (e) => {
        e.stopPropagation()
        setHover(true)
      },
      onPointerOut: () => setHover(false),
    },
  }
}

/* ── la pièce ─────────────────────────────────────────── */

function Room() {
  return (
    <group>
      <mesh position={[0, 3, -0.45]} receiveShadow>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial
          color={WALL}
          roughness={0.95}
          bumpMap={grain('platre', { size: 512, amp: 60, repeat: [10, 3.5] })}
          bumpScale={0.6}
        />
      </mesh>
      {/* plinthe */}
      <mesh position={[0, 0.05, -0.44]} receiveShadow>
        <boxGeometry args={[14, 0.1, 0.02]} />
        <meshStandardMaterial color="#e2e0db" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 7]} receiveShadow>
        <planeGeometry args={[24, 15]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={LITE ? 384 : 1024}
          mixBlur={1}
          mixStrength={1.6}
          roughness={0.6}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color={FLOOR}
          metalness={0.15}
          roughnessMap={grain('beton', { size: 512, base: 150, amp: 70, repeat: [6, 4] })}
        />
      </mesh>
    </group>
  )
}

// Cadre de fenêtre invisible placé devant le soleil : il ne se voit pas mais son
// ombre dessine la fenêtre sur le mur et le sol.
function WindowShadow({ sun }) {
  const ref = useRef()
  useEffect(() => {
    ref.current.lookAt(0, 0.8, -0.45)
  }, [])
  const bar = 0.07
  const W = 2.6
  const H = 2.1
  const pieces = [
    // bordures (grandes, pour faire de l'ombre autour de la fenêtre)
    [0, H / 2 + 3, 20, 6],
    [0, -H / 2 - 3, 20, 6],
    [-W / 2 - 3, 0, 6, H],
    [W / 2 + 3, 0, 6, H],
    // meneaux
    [0, 0, bar, H],
    [-W / 4, 0, bar * 0.6, H],
    [W / 4, 0, bar * 0.6, H],
    [0, H * 0.18, W, bar * 0.7],
  ]
  return (
    <group ref={ref} position={sun.clone().multiplyScalar(0.45)}>
      {pieces.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]} castShadow>
          <boxGeometry args={[w, h, 0.02]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ── l'étagère ────────────────────────────────────────── */

function Bay({ x, w, levels }) {
  const top = levels[levels.length - 1]
  const posts = [
    [x, 0],
    [x + w, 0],
    [x, -DEPTH],
    [x + w, -DEPTH],
  ]
  return (
    <group>
      {posts.map(([px, pz], i) => (
        <mesh key={i} position={[px, top / 2, pz]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, top + 0.02, 10]} />
          <meshStandardMaterial {...METAL} roughnessMap={grain('brosse', { streak: true, amp: 90 })} />
        </mesh>
      ))}
      {levels.map((y) => (
        <group key={y}>
          <ContactShadows
            frames={1}
            position={[x + w / 2, y + 0.0065, -DEPTH / 2]}
            scale={[w, DEPTH]}
            far={0.35}
            blur={2.2}
            opacity={0.7}
            resolution={256}
            color="#1c1915"
          />
          <mesh position={[x + w / 2, y, -DEPTH / 2]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.012, DEPTH]} />
            <meshStandardMaterial {...METAL} roughness={0.5} roughnessMap={grain('brosse', { streak: true, amp: 90 })} />
          </mesh>
          {/* tringle avant */}
          <mesh position={[x + w / 2, y + 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, w, 8]} />
            <meshStandardMaterial {...METAL} roughnessMap={grain('brosse', { streak: true, amp: 90 })} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ── les objets ───────────────────────────────────────── */

// Vrais modèles 3D (Poly Haven, licence CC0 : libres de droits, usage
// commercial permis). Fichiers compressés dans public/assets/3d/.
// Le modèle est mis à la hauteur voulue et posé sur `position` (bas du modèle).
const MODEL = (name) => `${import.meta.env.BASE_URL}assets/3d/${name}.glb`

function Model({ name, height, position, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(MODEL(name))
  const obj = useMemo(() => {
    const o = scene.clone(true)
    const box = new THREE.Box3().setFromObject(o)
    const size = box.getSize(new THREE.Vector3())
    const k = height / size.y
    o.scale.setScalar(k)
    const c = box.getCenter(new THREE.Vector3())
    o.position.set(-c.x * k, -box.min.y * k, -c.z * k)
    o.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
    return o
  }, [scene, height])
  return (
    <group position={position} rotation={rotation}>
      <primitive object={obj} />
    </group>
  )
}



// Haltère hexagonal : têtes en caoutchouc mat (posées à plat sur une face),
// bagues chromées et poignée moletée. `position` = sol ou tablette sous l'haltère.
function knurl() {
  if (TEX.knurl) return TEX.knurl
  const t = canvasTexture(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    for (let i = -w; i < w * 2; i += 8) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + h, h)
      ctx.moveTo(i + h, 0)
      ctx.lineTo(i, h)
      ctx.stroke()
    }
  })
  t.colorSpace = THREE.NoColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 10)
  TEX.knurl = t
  return t
}

function Dumbbell({ position, rotation = [0, 0, 0], color = '#1c1c1e', size = 1 }) {
  const R = 0.042 * size // rayon des têtes (pointe à pointe)
  const lift = R * Math.cos(Math.PI / 6) // une face à plat sur la tablette
  const rubber = (
    <meshStandardMaterial
      color={color}
      roughness={0.82}
      metalness={0}
      bumpMap={grain('caoutchouc', { amp: 110, repeat: [2, 2] })}
      bumpScale={0.35}
    />
  )
  return (
    <group position={position} rotation={rotation}>
      <group position={[0, lift, 0]}>
        {/* poignée moletée */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.0125 * size, 0.0125 * size, 0.13 * size, 20]} />
          <meshStandardMaterial color="#b9b9b6" metalness={0.9} roughness={0.35} bumpMap={knurl()} bumpScale={0.6} />
        </mesh>
        {[-1, 1].map((sgn) => (
          <group key={sgn} position={[sgn * 0.0925 * size, 0, 0]}>
            {/* tête hexagonale, arêtes adoucies */}
            <mesh rotation={[Math.PI / 6, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[R, R, 0.055 * size, 6]} />
              {rubber}
            </mesh>
            {/* bague chromée côté poignée */}
            <mesh position={[-sgn * 0.031 * size, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.021 * size, 0.021 * size, 0.008 * size, 24]} />
              <meshStandardMaterial color="#d6d6d3" metalness={1} roughness={0.18} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// Tapis de yoga roulé, debout contre le mur, tenu par sa sangle
function YogaMat({ position, rotation = [0, 0, 0], color = '#5a1418', height = 0.62 }) {
  const r = 0.06
  const end = useMemo(() => {
    const key = `tapis-${color}`
    if (TEX[key]) return TEX[key]
    const t = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.lineWidth = 3
      ctx.beginPath()
      for (let a = 0; a < Math.PI * 2 * 7; a += 0.05) {
        const rr = 6 + (a / (Math.PI * 2)) * 17
        const x = w / 2 + rr * Math.cos(a)
        const y = h / 2 + rr * Math.sin(a)
        if (a === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    })
    TEX[key] = t
    return t
  }, [color])
  const foam = (
    <meshStandardMaterial
      color={color}
      roughness={0.95}
      bumpMap={grain('mousse', { amp: 120, repeat: [4, 8] })}
      bumpScale={0.5}
    />
  )
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, height, 40, 1, true]} />
        {foam}
      </mesh>
      {/* les deux bouts : la spirale du tapis roulé */}
      {[0, height].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[y ? -Math.PI / 2 : Math.PI / 2, 0, 0]}>
          <circleGeometry args={[r, 40]} />
          <meshStandardMaterial map={end} roughness={0.95} />
        </mesh>
      ))}
      {/* sangle */}
      {[0.12, 0.82].map((k) => (
        <mesh key={k} position={[0, height * k, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[r + 0.002, 0.004, 8, 48]} />
          <meshStandardMaterial color="#2b2622" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}


function Trophy({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.07, 0.04, 0.07]} />
        <meshStandardMaterial color={INK} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.012, 0.06, 12]} />
        <meshStandardMaterial color="#c9b37e" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.02, 0.08, 24]} />
        <meshStandardMaterial color="#c9b37e" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  )
}

// Lampe bordeaux : globe sur un pied, avec sa lumière
function Lamp({ position, night }) {
  const light = useRef()
  const bulb = useRef()
  useFrame((_, dt) => {
    light.current.intensity = damp(light.current.intensity, night ? 3.2 : 0.4, 3, dt)
    bulb.current.emissiveIntensity = damp(bulb.current.emissiveIntensity, night ? 0.6 : 0, 3, dt)
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.05, 0.12, 24]} />
        <meshStandardMaterial color={ACCENT} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <sphereGeometry args={[0.09, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial
          ref={bulb}
          color="#6b0f12"
          emissive="#ff5a3a"
          emissiveIntensity={0}
          roughness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshBasicMaterial color="#ffd9b0" />
      </mesh>
      <pointLight ref={light} position={[0, 0.12, 0.08]} intensity={0.4} distance={2.6} decay={2} color="#ffb98a" />
    </group>
  )
}

// Télé TTP : mène aux services
function Tv({ position, onPick }) {
  const { hover, bind } = useHoverCursor()
  // écran : le monogramme brodé de TTP (logo du site) sur un fond bordeaux
  // presque noir, avec la lueur et les lignes d'un vieux tube cathodique
  const screen = useMemo(() => canvasTexture(512, 384, () => {}), [])
  useEffect(() => {
    const draw = (ctx, w, h, logo) => {
      const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7)
      bg.addColorStop(0, '#2a0b0c')
      bg.addColorStop(1, '#0b0607')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      if (logo) {
        const lh = h * 0.56
        const lw = (lh * logo.width) / logo.height
        ctx.drawImage(logo, (w - lw) / 2, h * 0.12, lw, lh)
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '500 22px ui-monospace, Menlo, monospace'
      ctx.fillStyle = 'rgba(235,225,210,0.7)'
      ctx.fillText('NOS SERVICES', w / 2, h * 0.84)
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)'
        ctx.fillRect(0, y, w, 1)
      }
    }
    screen.userData.redraw((ctx, w, h) => draw(ctx, w, h, null))
    const img = new Image()
    img.onload = () => screen.userData.redraw((ctx, w, h) => draw(ctx, w, h, img))
    img.src = `${import.meta.env.BASE_URL}assets/logo-light.png`
  }, [screen])
  const g = useRef()
  useFrame((_, dt) => {
    g.current.position.z = damp(g.current.position.z, position[2] + (hover ? 0.03 : 0), 8, dt)
  })
  return (
    <group ref={g} position={position} {...bind} onClick={onPick}>
      <Suspense fallback={null}>
        <Model name="television_02" height={0.3} position={[0, 0, 0]} />
        <mesh position={[0, 0.178, 0.131]}>
          <planeGeometry args={[0.205, 0.158]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </Suspense>
    </group>
  )
}

// Carnet « Méthode », posé de face : mène à la méthode
function Notebook({ position, onPick }) {
  const { hover, bind } = useHoverCursor()
  const cover = useMemo(
    () =>
      canvasTexture(256, 360, (ctx, w, h) => {
        ctx.fillStyle = '#5a0b0e'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#f3e9e2'
        ctx.font = '600 30px Inter, system-ui, sans-serif'
        ctx.fillText('Méthode', 24, 60)
        ctx.font = '500 15px ui-monospace, Menlo, monospace'
        ctx.fillStyle = 'rgba(243,233,226,0.7)'
        ctx.fillText('TTP CREATORS', 24, h - 30)
      }),
    [],
  )
  const g = useRef()
  useFrame((_, dt) => {
    g.current.rotation.x = damp(g.current.rotation.x, hover ? -0.02 : -0.16, 8, dt)
  })
  return (
    <group ref={g} position={position} {...bind} onClick={onPick}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.2, 0.28, 0.02]} />
        <meshStandardMaterial attach="material-0" color="#4a080b" />
        <meshStandardMaterial attach="material-1" color="#4a080b" />
        <meshStandardMaterial attach="material-2" color="#efe9e0" />
        <meshStandardMaterial attach="material-3" color="#efe9e0" />
        <meshStandardMaterial attach="material-4" map={cover} roughness={0.7} />
        <meshStandardMaterial attach="material-5" color="#4a080b" />
      </mesh>
    </group>
  )
}

// Boîte « Partenaires » : mène aux marques
function BrandBox({ position, onPick }) {
  const { hover, bind } = useHoverCursor()
  const face = useMemo(
    () =>
      canvasTexture(512, 256, (ctx, w, h) => {
        ctx.fillStyle = '#f1efe9'
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'
        ctx.strokeRect(14, 14, w - 28, h - 28)
        ctx.fillStyle = INK
        ctx.font = '600 44px Inter, system-ui, sans-serif'
        ctx.fillText('Partenaires', 40, 110)
        ctx.font = '500 20px ui-monospace, Menlo, monospace'
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillText('TESLA · RAY-BAN · HP · SPEEDO…', 40, 170)
      }),
    [],
  )
  const g = useRef()
  useFrame((_, dt) => {
    g.current.position.z = damp(g.current.position.z, position[2] + (hover ? 0.03 : 0), 8, dt)
  })
  return (
    <group ref={g} position={position} {...bind} onClick={onPick}>
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.18, 0.28]} />
        <meshStandardMaterial attach="material-0" color="#e7e4dc" />
        <meshStandardMaterial attach="material-1" color="#e7e4dc" />
        <meshStandardMaterial attach="material-2" color="#ece9e2" />
        <meshStandardMaterial attach="material-3" color="#ece9e2" />
        <meshStandardMaterial attach="material-4" map={face} roughness={0.8} />
        <meshStandardMaterial attach="material-5" color="#e7e4dc" />
      </mesh>
    </group>
  )
}

// Horloge murale double : Lyon et New York, à l'heure (deux fuseaux différents)
function WallClock({ position }) {
  const tex = useMemo(() => canvasTexture(640, 220, () => {}), [])
  useEffect(() => {
    const draw = (ctx, w, h) => {
      const now = new Date()
      const t = (tz) =>
        new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now)
      ctx.fillStyle = '#f6f5f1'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(w / 2 - 1, 30, 2, h - 60)
      ;[
        ['LYON', t('Europe/Paris'), w / 4],
        ['NEW YORK', t('America/New_York'), (3 * w) / 4],
      ].forEach(([city, time, x]) => {
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(0,0,0,0.62)'
        ctx.font = '600 30px ui-monospace, Menlo, monospace'
        ctx.fillText(city, x, 62)
        ctx.fillStyle = INK
        ctx.font = '600 84px Inter, system-ui, sans-serif'
        ctx.fillText(time, x, 160)
      })
    }
    tex.userData.redraw(draw)
    const id = setInterval(() => tex.userData.redraw(draw), 20000)
    return () => clearInterval(id)
  }, [tex])
  return (
    <group position={position}>
      <RoundedBox args={[0.5, 0.19, 0.04]} radius={0.012} castShadow>
        <meshStandardMaterial color="#e4e1da" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[0.46, 0.158]} />
        <meshStandardMaterial map={tex} roughness={0.4} />
      </mesh>
    </group>
  )
}

/* ── les créateurs encadrés ───────────────────────────── */

function CreatorFrame({ tex, index, count, cur, focus, selected, onPick, night }) {
  const g = useRef()
  const photo = useRef()
  const { hover, bind } = useHoverCursor()
  useFrame((_, dt) => {
    // position dans la boucle : décalage ramené entre -count/2 et +count/2
    let off = (((index - cur.current) % count) + count) % count
    if (off > count / 2) off -= count
    const x = ROW.cx + off * ROW.step
    const dist = Math.abs(x - ROW.cx)
    // en dehors de la travée, le cadre disparaît en douceur
    const fade = dist > ROW.half ? 0 : 1
    const pick = (focus && selected) || (!focus && hover)
    g.current.position.x = x
    g.current.position.z = damp(g.current.position.z, -0.12 + (pick ? 0.05 : 0), 7, dt)
    const s = fade * (focus && selected ? 1.04 : 1)
    g.current.scale.setScalar(damp(g.current.scale.x, s, 9, dt))
    g.current.visible = g.current.scale.x > 0.01
    g.current.rotation.x = damp(g.current.rotation.x, pick ? 0 : -0.1, 7, dt)
    // de jour la photo reçoit moins de lumière (sinon elle « brûle »), de nuit
    // elle garde un éclat propre, comme un tirage éclairé par la lampe
    const m = photo.current
    if (m) {
      const c = damp(m.color.r, night ? 0.5 : 0.58, 3, dt)
      m.color.setScalar(c)
      m.emissiveIntensity = damp(m.emissiveIntensity, night ? 0.36 : 0.06, 3, dt)
    }
  })
  return (
    <group ref={g} position={[0, ROW.y, -0.12]} {...bind} onClick={(e) => (e.stopPropagation(), onPick(index))}>
      <group position={[0, FRAME.h / 2 + 0.02, 0]}>
        {/* cadre blanc fin, à la largeur de la photo */}
        <mesh castShadow scale={[(FRAME.w * (tex?.userData.widthScale ?? 1) + 0.016) / (FRAME.w + 0.016), 1, 1]}>
          <boxGeometry args={[FRAME.w + 0.016, FRAME.h + 0.016, 0.014]} />
          <meshStandardMaterial color="#fbfaf7" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.0095]} scale={[tex?.userData.widthScale ?? 1, 1, 1]}>
          <planeGeometry args={[FRAME.w, FRAME.h]} />
          {tex ? (
            <meshStandardMaterial
              ref={photo}
              key={tex.uuid}
              map={tex}
              emissiveMap={tex}
              emissive="#ffffff"
              emissiveIntensity={0.12}
              color="#9e9e9e"
              roughness={1}
              metalness={0}
              envMapIntensity={0}
            />
          ) : (
            <meshStandardMaterial key="vide" color="#d9d6cf" />
          )}
        </mesh>
      </group>
    </group>
  )
}

/* ── caméra ───────────────────────────────────────────── */

function CameraRig({ focus, ready }) {
  const { camera, size, pointer } = useThree()
  const look = useRef(new THREE.Vector3(0, 0.75, 0))
  useFrame((_, dt) => {
    const aspect = size.width / size.height
    const portrait = aspect < 0.8
    camera.fov = portrait ? 50 : 32
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    let fit, tx, ty, ly
    if (focus) {
      fit = portrait ? 1.0 : 2.3
      tx = ROW.cx
      ty = 0.78
      ly = 0.66
    } else {
      fit = portrait ? 1.5 : 3.9
      tx = portrait ? ROW.cx : 0
      ty = 1.05
      ly = 0.72
    }
    const dist = fit / 2 / (tan * aspect) + (ready ? 0 : 4.5)
    const px = focus ? 0 : pointer.x * 0.18
    const py = focus ? 0 : pointer.y * 0.08
    camera.position.x = damp(camera.position.x, tx + px, 3, dt)
    camera.position.y = damp(camera.position.y, ty + py, 3, dt)
    camera.position.z = damp(camera.position.z, dist, ready ? 1.6 : 50, dt)
    look.current.x = damp(look.current.x, tx, 3, dt)
    look.current.y = damp(look.current.y, ly, 3, dt)
    camera.lookAt(look.current)
    camera.updateProjectionMatrix()
  })
  return null
}

/* ── la scène ─────────────────────────────────────────── */

function Studio({ creators, focus, index, onPickCreator, onNav, night, ready }) {
  const texs = usePhotoTextures(creators)
  // Défilé des créateurs : l'étagère n'en montre que 4 à la fois, alors elle
  // avance toute seule d'un cran toutes les 3 s (en boucle) pour que tout le
  // roster y passe. En mode zoom, elle va au créateur choisi par le plus court chemin.
  const n = creators.length
  const cur = useRef(1.5)
  const goal = useRef(1.5)
  const tick = useRef(0)
  const wasFocus = useRef(false)
  useFrame((_, dt) => {
    if (focus) {
      let d = (((index - goal.current) % n) + n) % n
      if (d > n / 2) d -= n
      goal.current += d
      tick.current = 0
    } else {
      if (wasFocus.current) goal.current += 0.5 // 4 cadres centrés
      tick.current += dt
      if (n > 4 && tick.current > 3) {
        tick.current = 0
        goal.current += 1
      }
    }
    wasFocus.current = focus
    cur.current = damp(cur.current, goal.current, 3.5, dt)
  })
  const sun = useMemo(() => new THREE.Vector3(-3.2, 4.2, 3.6), [])
  const amb = useRef()
  const hemi = useRef()
  const sunLight = useRef()
  const day = useMemo(() => new THREE.Color('#fff3e2'), [])
  const moon = useMemo(() => new THREE.Color('#9fb4d8'), [])
  const { scene } = useThree()
  useFrame((_, dt) => {
    const k = 2.5
    amb.current.intensity = damp(amb.current.intensity, night ? 0.05 : 0.55, k, dt)
    hemi.current.intensity = damp(hemi.current.intensity, night ? 0.04 : 0.45, k, dt)
    sunLight.current.intensity = damp(sunLight.current.intensity, night ? 0.35 : 2.4, k, dt)
    sunLight.current.color.lerp(night ? moon : day, 1 - Math.exp(-k * dt))
    scene.environmentIntensity = damp(scene.environmentIntensity ?? 1, night ? 0.12 : 1, k, dt)
  })

  return (
    <>
      <ambientLight ref={amb} intensity={0.55} />
      <hemisphereLight ref={hemi} args={['#ffffff', '#d8d2c8', 0.45]} />
      <directionalLight
        ref={sunLight}
        position={sun}
        intensity={2.4}
        color="#fff3e2"
        castShadow
        shadow-mapSize={LITE ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
      />
      <WindowShadow sun={sun} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.4} position={[0, 3, 3]} scale={[6, 2, 1]} />
        <Lightformer intensity={0.8} position={[-4, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer intensity={0.5} position={[4, 1, 1]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} />
      </Environment>

      <SoftShadows size={22} samples={LITE ? 6 : 12} focus={0.6} />
      <Room />
      <ContactShadows frames={1} position={[0, 0.002, -0.2]} scale={[3.4, 0.9]} far={1.4} blur={2.8} opacity={0.6} resolution={512} color="#1c1915" />
      {BAYS.map((b) => (
        <Bay key={b.x} {...b} />
      ))}

      {/* travée gauche */}
      <Suspense fallback={null}>
        <Model name="potted_plant_02" height={0.46} position={[-1.08, 1.206, -0.18]} rotation={[0, 0.6, 0]} />
        <Model name="book_encyclopedia_set_01" height={0.25} position={[-1.15, 0.826, -0.18]} />
        <Model name="camera_01" height={0.14} position={[-0.18, 0.946, -0.16]} rotation={[0, 0.35, 0]} />
        <Model name="ceramic_vase_01" height={0.24} position={[1.02, 0.946, -0.17]} />
      </Suspense>
      <Trophy position={[-0.74, 1.206, -0.17]} />
      {/* paire d'haltères à la place des ballons */}
      <Dumbbell position={[-0.64, 0.826, -0.11]} rotation={[0, 0.12, 0]} size={1.15} />
      <Dumbbell position={[-0.63, 0.826, -0.25]} rotation={[0, 0.05, 0]} size={1.15} />
      <Dumbbell position={[-1.05, 0.446, -0.15]} rotation={[0, 0.35, 0]} color={ACCENT} size={1.2} />
      {/* tapis de yoga roulé, posé au sol contre le mur, à droite de l'étagère */}
      <YogaMat position={[1.5, 0.06, -0.33]} rotation={[0, 0, -Math.PI / 2]} height={0.56} />
      <BrandBox position={[-0.95, 0.066, -0.16]} onPick={() => onNav('clients')} />

      {/* travée du milieu : les créateurs */}
      {creators.map((c, i) => (
        <CreatorFrame
          key={c.name + i}
          tex={texs[c.photo]}
          index={i}
          count={n}
          cur={cur}
          focus={focus}
          selected={i === index}
          night={night}
          onPick={onPickCreator}
        />
      ))}
      <Lamp position={[0.55, 0.946, -0.17]} night={night} />
      <Suspense fallback={null}>
        <Model name="book_encyclopedia_set_01" height={0.28} position={[-0.2, 0.066, -0.18]} rotation={[0, Math.PI, 0]} />
      </Suspense>
      <Notebook position={[0.45, 0.066, -0.1]} onPick={() => onNav('method')} />

      {/* travée droite */}
      <Dumbbell position={[1.22, 0.946, -0.16]} rotation={[0, -0.4, 0]} size={0.85} />
      <Suspense fallback={null}>
        <Model name="ceramic_vase_03" height={0.3} position={[1.0, 0.506, -0.17]} rotation={[0, 0.4, 0]} />
      </Suspense>
      <Tv position={[1.12, 0.066, -0.17]} onPick={() => onNav('services')} />

      {/* mur */}
      {/* sur téléphone (écran en hauteur), l'horloge se rapproche du centre pour rester entière */}
      <WallClock position={PORTRAIT ? [0.3, 1.5, -0.42] : [0.95, 1.62, -0.42]} />

      <CameraRig focus={focus} ready={ready} />
      <EffectComposer multisampling={LITE ? 0 : 4} enableNormalPass={false}>
                <Bloom intensity={night ? 0.22 : 0} luminanceThreshold={0.97} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.3} darkness={0.32} />
        <Noise opacity={0.035} premultiply />
      </EffectComposer>
    </>
  )
}

export default function Scene({ creators, focus, index, onPickCreator, onNav, active, night, ready, onFail }) {
  // résolution : on démarre raisonnable et on ajuste selon la fluidité réelle
  const [dpr, setDpr] = useState(LITE ? 1.25 : 1.5)
  return (
    <Canvas
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onFail?.()
        })
      }}
      shadows
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.4, 9], fov: 32, near: 0.05, far: 40 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.18 }}
      onPointerMissed={() => document.body.style.removeProperty('cursor')}
    >
      <PerformanceMonitor
        onIncline={() => setDpr((d) => Math.min(d + 0.25, LITE ? 1.5 : 2))}
        onDecline={() => setDpr((d) => Math.max(d - 0.25, 0.75))}
      />
      <Studio
        creators={creators}
        focus={focus}
        index={index}
        onPickCreator={onPickCreator}
        onNav={onNav}
        night={night}
        ready={ready}
      />
    </Canvas>
  )
}
