import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal from './Reveal.jsx'
import { asset } from '../data.js'
import { useOnScreen } from '../lib/onScreen.js'

// Services façon template « Ollef » : lignes géantes empilées (l'active en
// encre, les autres estompées), image + légende à droite qui suivent la
// sélection. Survol au desktop, défilement auto sinon.
// Photos coulisses fournies par Marc (assets/services/), une par métier.

const OFFER = [
  {
    key: 'talent',
    label: 'Talent Management',
    caption:
      "Pour les créateurs : on négocie les contrats et les tarifs, on tient le planning et on développe les revenus. Le créateur se concentre sur ses contenus.",
    photo: 'assets/services/talent.webp',
  },
  {
    key: 'production',
    label: 'Production',
    caption:
      "Idée, tournage, montage : on produit des photos et des vidéos prêtes à publier, au bon format pour Instagram, TikTok ou YouTube.",
    photo: 'assets/services/production.webp',
  },
  {
    key: 'social',
    label: 'Social Media',
    caption:
      "Quoi publier, quand et sous quel format : on construit la ligne éditoriale, on lit les statistiques et on ajuste pour faire grandir la communauté.",
    photo: 'assets/services/social.webp',
  },
  {
    key: 'partenariats',
    label: 'Partenariats',
    caption:
      "Pour les marques : on choisit les créateurs qui parlent à votre cible, on cadre le brief, le contrat et les droits, puis on vous rend un bilan chiffré.",
    photo: 'assets/services/partenariats.webp',
  },
]

export default function Services() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [ref, on] = useOnScreen()

  // Défilement auto tant que la souris n'est pas sur la liste et que la section est à l'écran.
  useEffect(() => {
    if (hovered || !on) return
    const id = setInterval(() => setActive((i) => (i + 1) % OFFER.length), 3500)
    return () => clearInterval(id)
  }, [hovered, on])

  const current = OFFER[active]

  return (
    <section className="sec svc2" id="services" ref={ref}>
      <div className="wrap">
        <Reveal className="svc2-label">(Ce qu'on fait)</Reveal>
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
