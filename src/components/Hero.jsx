import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

// Ouverture (maquette « dôme », version blanche) : une ligne de titre qui dit ce
// qu'est TTP et deux boutons (marque / créateur). Le dôme du roster, juste
// dessous, fait l'image de l'écran d'accueil.

const EASE = [0.22, 1, 0.36, 1]

export default function Hero({ ready = true }) {
  const reduce = useReducedMotion()
  const rise = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
          transition: { delay, duration: 0.9, ease: EASE },
        }

  return (
    <section className="hero hx" id="hero">
      <h1 className="hx-title">
        <motion.span className="hx-line" {...rise(0.15)}>
          L'agence des créateurs <span className="hx-soft">sport &amp; lifestyle.</span>
        </motion.span>
      </h1>

      <motion.div className="hx-actions" {...rise(0.3)}>
        <a className="hx-btn hx-btn-dark" href="#roster">
          Je suis une marque
          <ArrowRight size={15} strokeWidth={2} />
        </a>
        <a className="hx-btn" href="#contact">
          Je suis créateur
          <ArrowRight size={15} strokeWidth={2} />
        </a>
      </motion.div>
    </section>
  )
}
