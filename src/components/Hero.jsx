import { motion, useReducedMotion } from 'motion/react'

// Hero éditorial sombre (direction template « Ollef » choisie par Marc) :
// nav minimale, paragraphe-mission en haut à droite, logotype géant TTP®
// en bas, « Scroller pour explorer ». Fond noir, typo Inter Variable serrée.

const EASE = [0.22, 1, 0.36, 1]

export default function Hero() {
  const reduce = useReducedMotion()

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="hero" id="hero">
      <div className="hero-top">
        <motion.p
          className="hero-statement"
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 1, ease: EASE }}
        >
          On transforme les créateurs en marques. Chaque détail — image, contenus,
          partenariats — est façonné pour connecter les bonnes marques aux bons
          créateurs, et faire durer ce qui marche.
        </motion.p>
      </div>

      <div className="hero-bottom">
        <motion.h1
          className="hero-wordmark"
          initial={reduce ? false : { opacity: 0, y: '16%' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: EASE }}
        >
          TTP<span className="hero-r">®</span>
        </motion.h1>

        <motion.button
          type="button"
          className="hero-scroll"
          onClick={scrollDown}
          aria-label="Faire défiler vers le contenu"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.9, ease: EASE }}
        >
          Scroller pour explorer ↓
        </motion.button>
      </div>
    </section>
  )
}
