import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

// Ouverture (maquette « dôme », version blanche) : une phrase courte qui dit ce
// qu'est TTP, deux boutons (marque / créateur), et le dôme du roster juste dessous.

const EASE = [0.22, 1, 0.36, 1]

export default function Hero({ ready = true }) {
  const reduce = useReducedMotion()
  const rise = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
          transition: { delay, duration: 1, ease: EASE },
        }

  return (
    <section className="hero hx" id="hero">
      <h1 className="hx-title">
        <motion.span className="hx-line" {...rise(0.15)}>
          L'agence des créateurs
        </motion.span>{' '}
        <motion.span className="hx-line hx-soft" {...rise(0.28)}>
          sport &amp; lifestyle.
        </motion.span>
      </h1>

      <motion.div className="hx-actions" {...rise(0.45)}>
        <a className="hx-btn hx-btn-dark" href="#roster">
          Je suis une marque
          <ArrowRight size={16} strokeWidth={2} />
        </a>
        <a className="hx-btn" href="#contact">
          Je suis créateur
          <ArrowRight size={16} strokeWidth={2} />
        </a>
      </motion.div>
    </section>
  )
}
