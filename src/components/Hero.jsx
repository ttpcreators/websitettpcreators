import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import BorderBeam from './BorderBeam.jsx'

// Hero « motion design » : titre « Trust The Process. » (initiales TTP)
// tapé à la machine avec curseur bordeaux, reflet dégradé animé sur
// « Process. », halos ambiants, fondu/rétrécissement au scroll.

const EASE_SOFT = [0.22, 1, 0.36, 1]

const TITLE = 'Trust The Process.'
const GRAD_FROM = TITLE.indexOf('Process') // début de la partie en dégradé

// Effet machine à écrire : un fantôme invisible réserve la largeur finale
// (le bloc centré ne bouge pas), le texte tapé se superpose par-dessus.
function TypeTitle({ reduce, startDelay = 500, speed = 72 }) {
  const [n, setN] = useState(reduce ? TITLE.length : 0)
  const [done, setDone] = useState(reduce)

  useEffect(() => {
    if (reduce) return
    let interval
    let endTimeout
    const start = setTimeout(() => {
      let i = 0
      interval = setInterval(() => {
        i += 1
        setN(i)
        if (i >= TITLE.length) {
          clearInterval(interval)
          endTimeout = setTimeout(() => setDone(true), 1200)
        }
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      clearTimeout(endTimeout)
      if (interval) clearInterval(interval)
    }
  }, [reduce, startDelay, speed])

  const typed = TITLE.slice(0, n)
  const head = typed.slice(0, GRAD_FROM)
  const tail = typed.slice(GRAD_FROM)

  return (
    <h1 className="hero-h1 hero-h1-type">
      <span className="hh-ghost" aria-hidden="true">
        {TITLE}
      </span>
      <span className="hh-typed" aria-hidden="true">
        {head}
        {tail && <span className="hh-grad">{tail}</span>}
        {!done && <span className="hero-caret" />}
      </span>
      <span className="sr-only">{TITLE}</span>
    </h1>
  )
}

// Bloc qui apparaît en fondu + léger déflou, sans découpe par mot
function BlurIn({ children, delay, reduce, className, y = 14 }) {
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.9, ease: EASE_SOFT }}
    >
      {children}
    </motion.div>
  )
}

function Aurora({ reduce }) {
  const drift = (path, duration) =>
    reduce
      ? {}
      : {
          animate: path,
          transition: { duration, repeat: Infinity, ease: 'easeInOut' },
        }
  return (
    <div className="hero-aurora" aria-hidden="true">
      <motion.span
        className="aur aur-1"
        {...drift({ x: [0, 70, -40, 0], y: [0, -50, 30, 0], scale: [1, 1.12, 0.95, 1] }, 24)}
      />
      <motion.span
        className="aur aur-2"
        {...drift({ x: [0, -60, 40, 0], y: [0, 40, -30, 0], scale: [1, 0.94, 1.1, 1] }, 30)}
      />
      <motion.span
        className="aur aur-3"
        {...drift({ x: [0, 50, -50, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.96, 1] }, 20)}
      />
    </div>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const ref = useRef(null)

  // au scroll : le bloc central rétrécit et s'estompe, façon page produit Apple
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, -60])
  const contentStyle = reduce ? {} : { scale, opacity, y }

  const scrollDown = () =>
    window.scrollTo({ top: window.innerHeight * 0.96, behavior: 'smooth' })

  return (
    <section className="hero" id="hero" ref={ref}>
      <Aurora reduce={reduce} />

      <motion.div className="hero-center" style={contentStyle}>
        <BlurIn className="hero-eyebrow" delay={0.15} reduce={reduce}>
          <span className="hero-dot" />
          <span>Agence de talent management</span>
        </BlurIn>

        <TypeTitle reduce={reduce} />

        <BlurIn className="hero-lead" delay={1.7} reduce={reduce}>
          L'agence qui transforme les créatrices en marques.
          <br />
          Image, partenariats, croissance — on s'occupe de tout.
        </BlurIn>

        <BlurIn className="hero-ctas" delay={1.95} reduce={reduce} y={10}>
          <a className="btn btn-dark" href="#roster">
            Découvrir le roster
          </a>
          <a className="btn btn-ghost" href="#contact">
            Travailler avec nous
            <BorderBeam />
          </a>
        </BlurIn>
      </motion.div>

      <motion.button
        className="hero-cue"
        type="button"
        aria-label="Faire défiler"
        onClick={scrollDown}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1 }}
      >
        <span>Découvrir</span>
        <motion.span
          className="hero-cue-ic"
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} strokeWidth={2} />
        </motion.span>
      </motion.button>
    </section>
  )
}
