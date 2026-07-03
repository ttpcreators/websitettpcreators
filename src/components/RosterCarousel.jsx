import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { InstagramIcon, TikTokIcon } from './icons.jsx'
import { igUser, initials } from '../lib/format.js'

// Carousel du roster : pile de photos qui tournent (rotation aléatoire,
// fondu, profondeur) + fiche créatrice animée. Porté depuis la version
// shadcn/Tailwind (AnimatedTestimonials) vers le stack du site.

const randomRotate = () => `${Math.floor(Math.random() * 16) - 8}deg`

const NICHE_DESC = {
  sport:
    "Univers Sport : entraînement, performance et lifestyle athlétique. Des formats qui bougent, une communauté qui suit.",
  lifestyle:
    "Univers Lifestyle : quotidien, mode et inspiration. Des contenus incarnés, au plus près de sa communauté.",
}

export default function RosterCarousel({ creators, autoplay = true }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  // incrémenté à chaque navigation manuelle : relance le chrono d'autoplay
  // à zéro, sinon le timer peut tomber juste après un clic (saut de +2)
  const [resetToken, setResetToken] = useState(0)
  const count = creators.length

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % count)
  }, [count])

  const handlePrev = () => setActive((prev) => (prev - 1 + count) % count)

  const goNext = () => {
    handleNext()
    setResetToken((t) => t + 1)
  }

  const goPrev = () => {
    handlePrev()
    setResetToken((t) => t + 1)
  }

  useEffect(() => {
    if (!autoplay || paused || count < 2) return
    const interval = setInterval(handleNext, 5000)
    return () => clearInterval(interval)
  }, [autoplay, paused, handleNext, count, resetToken])

  // si la liste change (arrivée des données Supabase), on repart au début
  useEffect(() => {
    if (active >= count && count > 0) setActive(0)
  }, [count, active])

  if (count === 0) return null

  const current = creators[Math.min(active, count - 1)]
  const user = igUser(current.handle)
  const hasSocial = user && user.toLowerCase() !== 'nouveau'
  const pad2 = (n) => String(n).padStart(2, '0')

  return (
    <div
      className="rt"
      onMouseEnter={() => {
        if (window.matchMedia('(hover: hover)').matches) setPaused(true)
      }}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rt-stage">
        <AnimatePresence>
          {creators.map((c, index) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.9, y: 50, rotate: randomRotate() }}
              animate={{
                opacity: index === active ? 1 : 0.5,
                scale: index === active ? 1 : 0.9,
                y: index === active ? 0 : 20,
                zIndex: index === active ? count : count - Math.abs(index - active),
                rotate: index === active ? '0deg' : randomRotate(),
              }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="rt-card"
            >
              <span className="rt-ph" aria-hidden="true">
                {initials(c.name)}
              </span>
              {c.photo && (
                <img
                  src={c.photo}
                  alt={c.name}
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="rt-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active}-${count}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {current.niche && <span className="rt-badge">{current.niche}</span>}
            <h3 className="rt-name">{current.name}</h3>
            {hasSocial ? (
              <a
                className="rt-handle"
                href={`https://instagram.com/${user}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {current.handle}
              </a>
            ) : (
              <span className="rt-handle">{current.handle}</span>
            )}
            <p className="rt-desc">
              {NICHE_DESC[String(current.niche || '').toLowerCase()] ||
                'Une créatrice accompagnée par TTP Creators, de la stratégie aux campagnes.'}
            </p>
            <div className="rt-actions">
              {hasSocial && (
                <>
                  <a
                    className="rt-ic"
                    href={`https://instagram.com/${user}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${current.name}`}
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    className="rt-ic"
                    href={`https://tiktok.com/@${user}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`TikTok de ${current.name}`}
                  >
                    <TikTokIcon />
                  </a>
                </>
              )}
              <a className="btn btn-dark" href="#contact">
                Collaborer <ArrowUpRight size={15} strokeWidth={2.5} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="rt-nav">
          <button
            className="rt-arrow rt-arrow-prev"
            type="button"
            onClick={goPrev}
            aria-label="Créatrice précédente"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="rt-arrow rt-arrow-next"
            type="button"
            onClick={goNext}
            aria-label="Créatrice suivante"
          >
            <ArrowRight size={18} />
          </button>
          <span className="rt-count">
            {pad2(active + 1)} — {pad2(count)}
          </span>
        </div>
      </div>
    </div>
  )
}
