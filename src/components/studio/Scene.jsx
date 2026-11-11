import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

// Le studio TTP en 3D : une pièce blanche baignée de soleil (ombre de fenêtre
// projetée sur le mur), un sol qui reflète, une étagère métallique avec les
// créateurs encadrés et des objets sport & lifestyle. Tout est construit en code
// (pas de modèle à télécharger) pour rester léger.
// Unités : mètres. Le mur est à z = -0.45, le devant de l'étagère à z = 0.

const WALL = '#eceae5'
const FLOOR = '#dcd9d3'
const METAL = { color: '#cfcfcc', metalness: 0.75, roughness: 0.3 }
const ACCENT = '#3d0000'
const INK = '#141416'

// étagère : trois travées
const BAYS = [
  { x: -1.4, w: 0.9, levels: [0.06, 0.44, 0.82, 1.2] },
  { x: -0.48, w: 1.3, levels: [0.06, 0.5, 0.94] },
  { x: 0.84, w: 0.56, levels: [0.06, 0.5, 0.94] },
]
const DEPTH = 0.36
const ROW = { y: 0.506, cx: 0.17, half: 0.62, step: 0.3 } // rangée des créateurs (travée du milieu)
const FRAME = { w: 0.24, h: 0.32 }

/* ── utilitaires ──────────────────────────────────────── */

const damp = THREE.MathUtils.damp

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
    tex.offset.set(0, (1 - ia / aspect) * 0.65) // garde le visage (haut de l'image)
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
          cover(t, FRAME.w / FRAME.h)
          if (alive) setTexs((m) => ({ ...m, [c.photo]: t }))
        },
        undefined,
        () => {},
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
      <mesh position={[0, 2, -0.45]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {/* plinthe */}
      <mesh position={[0, 0.05, -0.44]} receiveShadow>
        <boxGeometry args={[14, 0.1, 0.02]} />
        <meshStandardMaterial color="#e2e0db" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={1024}
          mixBlur={1}
          mixStrength={0.9}
          roughness={0.75}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color={FLOOR}
          metalness={0.15}
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
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
      {levels.map((y) => (
        <group key={y}>
          <mesh position={[x + w / 2, y, -DEPTH / 2]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.012, DEPTH]} />
            <meshStandardMaterial {...METAL} roughness={0.4} />
          </mesh>
          {/* tringle avant */}
          <mesh position={[x + w / 2, y + 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, w, 8]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ── les objets ───────────────────────────────────────── */

function Books({ x, y, colors, lean = 0 }) {
  let cx = x
  return (
    <group>
      {colors.map(([c, w, h], i) => {
        const px = cx + w / 2
        cx += w + 0.003
        return (
          <mesh
            key={i}
            position={[px, y + h / 2, -0.17]}
            rotation={[0, 0, i === colors.length - 1 ? lean : 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[w, h, 0.2]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

function Dumbbell({ position, rotation = [0, 0, 0] }) {
  const mat = <meshStandardMaterial color={INK} roughness={0.45} metalness={0.4} />
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.26, 12]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {[-0.1, 0.1].map((dx) => (
        <mesh key={dx} position={[dx, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 6]} />
          {mat}
        </mesh>
      ))}
    </group>
  )
}

function Kettlebell({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <sphereGeometry args={[0.075, 32, 24]} />
        <meshStandardMaterial color={ACCENT} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <torusGeometry args={[0.045, 0.012, 12, 32, Math.PI]} />
        <meshStandardMaterial color={ACCENT} roughness={0.35} metalness={0.3} />
      </mesh>
    </group>
  )
}

function Ball({ position }) {
  return (
    <mesh position={position} castShadow>
      <icosahedronGeometry args={[0.085, 1]} />
      <meshStandardMaterial color="#f4f3ef" roughness={0.55} flatShading />
    </mesh>
  )
}

function Bottle({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.2, 24]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.08} transmission={0.9} thickness={0.05} />
      </mesh>
      <mesh position={[0, 0.215, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.03, 0.03, 16]} />
        <meshStandardMaterial color={INK} roughness={0.5} />
      </mesh>
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
function Lamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.05, 0.12, 24]} />
        <meshStandardMaterial color={ACCENT} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <sphereGeometry args={[0.09, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color="#6b0f12" roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshBasicMaterial color="#ffd9b0" />
      </mesh>
      <pointLight position={[0, 0.12, 0.05]} intensity={0.5} distance={1.2} color="#ffb98a" />
    </group>
  )
}

// Télé TTP : mène aux services
function Tv({ position, onPick }) {
  const { hover, bind } = useHoverCursor()
  const screen = useMemo(
    () =>
      canvasTexture(512, 384, (ctx, w, h) => {
        ctx.fillStyle = '#0d0d0f'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#ffffff'
        ctx.font = '600 120px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('TTP', w / 2, h / 2 - 18)
        ctx.font = '500 26px ui-monospace, Menlo, monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fillText('NOS SERVICES ▸', w / 2, h / 2 + 70)
        for (let y = 0; y < h; y += 4) {
          ctx.fillStyle = 'rgba(255,255,255,0.03)'
          ctx.fillRect(0, y, w, 1)
        }
      }),
    [],
  )
  const g = useRef()
  useFrame((_, dt) => {
    g.current.position.z = damp(g.current.position.z, position[2] + (hover ? 0.03 : 0), 8, dt)
  })
  return (
    <group ref={g} position={position} {...bind} onClick={onPick}>
      <RoundedBox args={[0.42, 0.32, 0.3]} radius={0.03} castShadow>
        <meshStandardMaterial color="#e9e6df" roughness={0.6} />
      </RoundedBox>
      <mesh position={[-0.04, 0.01, 0.151]}>
        <planeGeometry args={[0.28, 0.21]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      {[0.06, -0.02].map((y) => (
        <mesh key={y} position={[0.16, y, 0.152]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.01, 16]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      ))}
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

// Horloge murale double : Lyon et Genève, à l'heure
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
        ['GENÈVE', t('Europe/Zurich'), (3 * w) / 4],
      ].forEach(([city, time, x]) => {
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.font = '500 22px ui-monospace, Menlo, monospace'
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

function CreatorFrame({ tex, index, cur, focus, selected, onPick }) {
  const g = useRef()
  const { hover, bind } = useHoverCursor()
  useFrame((_, dt) => {
    const x = ROW.cx + (index - cur.current) * ROW.step
    const dist = Math.abs(x - ROW.cx)
    // en dehors de la travée, le cadre disparaît en douceur
    const fade = dist > ROW.half ? 0 : 1
    const pick = (focus && selected) || (!focus && hover)
    g.current.position.x = x
    g.current.position.z = damp(g.current.position.z, -0.12 + (pick ? 0.09 : 0), 7, dt)
    const s = fade * (focus && selected ? 1.12 : 1)
    g.current.scale.setScalar(damp(g.current.scale.x, s, 9, dt))
    g.current.visible = g.current.scale.x > 0.01
    g.current.rotation.x = damp(g.current.rotation.x, pick ? 0 : -0.1, 7, dt)
  })
  return (
    <group ref={g} position={[0, ROW.y, -0.12]} {...bind} onClick={(e) => (e.stopPropagation(), onPick(index))}>
      <group position={[0, FRAME.h / 2 + 0.02, 0]}>
        {/* cadre blanc + passe-partout */}
        <mesh castShadow>
          <boxGeometry args={[FRAME.w + 0.04, FRAME.h + 0.04, 0.018]} />
          <meshStandardMaterial color="#fbfaf7" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.0095]}>
          <planeGeometry args={[FRAME.w, FRAME.h]} />
          {tex ? (
            <meshStandardMaterial key={tex.uuid} map={tex} roughness={0.55} />
          ) : (
            <meshStandardMaterial key="vide" color="#d9d6cf" />
          )}
        </mesh>
      </group>
    </group>
  )
}

/* ── caméra ───────────────────────────────────────────── */

function CameraRig({ focus }) {
  const { camera, size, pointer } = useThree()
  const look = useRef(new THREE.Vector3(0, 0.75, 0))
  useFrame((_, dt) => {
    const aspect = size.width / size.height
    const portrait = aspect < 0.8
    camera.fov = portrait ? 50 : 32
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    let fit, tx, ty, ly
    if (focus) {
      fit = portrait ? 0.7 : 1.5
      tx = ROW.cx
      ty = 0.74
      ly = 0.68
    } else {
      fit = portrait ? 1.5 : 3.9
      tx = portrait ? ROW.cx : 0
      ty = 1.05
      ly = 0.72
    }
    const dist = fit / 2 / (tan * aspect)
    const px = focus ? 0 : pointer.x * 0.18
    const py = focus ? 0 : pointer.y * 0.08
    camera.position.x = damp(camera.position.x, tx + px, 3, dt)
    camera.position.y = damp(camera.position.y, ty + py, 3, dt)
    camera.position.z = damp(camera.position.z, dist, 3, dt)
    look.current.x = damp(look.current.x, tx, 3, dt)
    look.current.y = damp(look.current.y, ly, 3, dt)
    camera.lookAt(look.current)
    camera.updateProjectionMatrix()
  })
  return null
}

/* ── la scène ─────────────────────────────────────────── */

function Studio({ creators, focus, index, onPickCreator, onNav }) {
  const texs = usePhotoTextures(creators)
  const cur = useRef(1.5)
  useFrame((_, dt) => {
    const target = focus ? index : Math.min(1.5, (creators.length - 1) / 2)
    cur.current = damp(cur.current, target, 5, dt)
  })
  const sun = useMemo(() => new THREE.Vector3(-3.2, 4.2, 3.6), [])

  return (
    <>
      <color attach="background" args={[WALL]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#d8d2c8', 0.45]} />
      <directionalLight
        position={sun}
        intensity={2.4}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
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

      <Room />
      {BAYS.map((b) => (
        <Bay key={b.x} {...b} />
      ))}

      {/* travée gauche */}
      <Kettlebell position={[-1.18, 1.206, -0.17]} />
      <Trophy position={[-0.78, 1.206, -0.17]} />
      <Books
        x={-1.32}
        y={0.826}
        colors={[
          ['#efece6', 0.03, 0.27],
          [INK, 0.025, 0.25],
          ['#d8d3ca', 0.035, 0.29],
          ['#7a1216', 0.022, 0.24],
          ['#f4f2ee', 0.03, 0.26],
        ]}
        lean={-0.25}
      />
      <Ball position={[-0.78, 0.911, -0.15]} />
      <Dumbbell position={[-1.05, 0.49, -0.15]} rotation={[0, 0.35, 0]} />
      <Books
        x={-0.82}
        y={0.446}
        colors={[
          ['#e7e3db', 0.028, 0.24],
          ['#cfc9bf', 0.03, 0.26],
          [INK, 0.02, 0.22],
        ]}
      />
      <BrandBox position={[-0.95, 0.066, -0.16]} onPick={() => onNav('clients')} />

      {/* travée du milieu : les créateurs */}
      {creators.map((c, i) => (
        <CreatorFrame
          key={c.name + i}
          tex={texs[c.photo]}
          index={i}
          cur={cur}
          focus={focus}
          selected={i === index}
          onPick={onPickCreator}
        />
      ))}
      <Lamp position={[0.55, 0.946, -0.17]} />
      <Ball position={[-0.2, 1.031, -0.16]} />
      <Books
        x={-0.4}
        y={0.066}
        colors={[
          ['#f2f0eb', 0.03, 0.3],
          ['#d9d4cb', 0.026, 0.28],
          [INK, 0.034, 0.31],
          ['#e8e4dc', 0.028, 0.27],
          ['#a39d93', 0.02, 0.25],
          ['#f2f0eb', 0.03, 0.29],
        ]}
      />
      <Notebook position={[0.45, 0.066, -0.1]} onPick={() => onNav('method')} />

      {/* travée droite */}
      <Bottle position={[1.0, 0.946, -0.15]} />
      <Dumbbell position={[1.2, 0.99, -0.16]} rotation={[0, -0.4, 0]} />
      <Books
        x={0.92}
        y={0.506}
        colors={[
          ['#7a1216', 0.03, 0.26],
          ['#efece6', 0.028, 0.28],
          [INK, 0.022, 0.24],
        ]}
        lean={-0.3}
      />
      <Tv position={[1.12, 0.226, -0.13]} onPick={() => onNav('services')} />

      {/* mur */}
      <WallClock position={[0.95, 1.62, -0.42]} />

      <CameraRig focus={focus} />
    </>
  )
}

export default function Scene({ creators, focus, index, onPickCreator, onNav, active }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.02, 5], fov: 32, near: 0.05, far: 40 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.18 }}
      onPointerMissed={() => document.body.style.removeProperty('cursor')}
    >
      <Studio creators={creators} focus={focus} index={index} onPickCreator={onPickCreator} onNav={onNav} />
    </Canvas>
  )
}
