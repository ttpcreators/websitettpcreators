import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal from './Reveal.jsx'
import { asset } from '../data.js'

// Services façon template « Ollef » : lignes géantes empilées (l'active en
// encre, les autres estompées), image + légende à droite qui suivent la
// sélection. Survol au desktop, défilement auto sinon.
// Photos coulisses fournies par Marc (assets/services/), une par métier.

const OFFER = [
  {
    key: 'talent',
    label: 'Talent Management',
    caption:
      "Carrière, négociations, planning et revenus : on gère la structure, les créateurs se concentrent sur la création.",
    photo: 'assets/services/talent.jpg',
  },
  {
    key: 'production',
    label: 'Production',
    caption:
      "Direction artistique, tournage, montage — du contenu prêt à performer, pensé pour chaque plateforme.",
    photo: 'assets/services/production.jpg',
  },
  {
    key: 'social',
    label: 'Social Media',
    caption:
      "Ligne éditoriale, formats, calendrier et lecture des performances : une croissance qui ne doit rien au hasard.",
    photo: 'assets/services/social.jpg',
  },
  {
    key: 'partenariats',
    label: 'Partenariats',
    caption:
      "Sourcing, brief, activation et reporting — les bonnes marques connectées aux bons créateurs.",
    photo: 'assets/services/partenariats.jpg',
  },
]

export default function Services() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)

  // Défilement auto tant que la souris n'est pas sur la liste.
  useEffect(() => {
    if (hovered) return
    const id = setInterval(() => setActive((i) => (i + 1) % OFFER.length), 3500)
    return () => clearInterval(id)
  }, [hovered])

  const current = OFFER[active]

  return (
    <section className="sec svc2" id="services">
      <div className="wrap">
        <Reveal className="svc2-label">(Services)</Reveal>
        <div className="svc2-grid">
          <div
            className="svc2-list"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {OFFER.map((s, i) => (
              <Reveal key={s.key} delay={i * 0.07}>
                <button
                  type="button"
                  className={`svc2-line${i === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  {s.label}
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal className="svc2-side" delay={0.15}>
            <div className="svc2-media">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current.key}
                  src={asset(current.photo)}
                  alt={current.label}
                  loading="lazy"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={current.key}
                className="svc2-caption"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {current.caption}
              </motion.p>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
