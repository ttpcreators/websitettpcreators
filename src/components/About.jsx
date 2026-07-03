import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal, { Eyebrow } from './Reveal.jsx'
import { Tooltip } from './TooltipCard.jsx'
import { PILLARS, asset } from '../data.js'

// Les deux co-fondateurs : rotation auto toutes les 4 s + clic pour changer.
// Si une photo manque (ex. gianni.jpg pas encore déposée dans
// public/assets/about/), un placeholder à initiales prend le relais.
const FOUNDERS = [
  { name: 'Marc Maher', role: 'Co-founder', photo: 'assets/about/equipe.jpg' },
  { name: 'Gianni', role: 'Co-founder', photo: 'assets/about/gianni.jpg' },
]

const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

function FounderPhoto() {
  const [idx, setIdx] = useState(0)
  const [resetToken, setResetToken] = useState(0)
  const [broken, setBroken] = useState({})
  const f = FOUNDERS[idx]

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % FOUNDERS.length), 4000)
    return () => clearInterval(id)
  }, [resetToken])

  // clic = fondateur suivant + remise à zéro du chrono (pas de double saut)
  const next = () => {
    setIdx((i) => (i + 1) % FOUNDERS.length)
    setResetToken((t) => t + 1)
  }

  return (
    <Reveal
      className="about-photo about-photo-click"
      onClick={next}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          next()
        }
      }}
      aria-label={`Co-fondateurs de TTP Creators — cliquer pour voir le suivant (affiché : ${f.name})`}
    >
      <span className="about-ph" aria-hidden="true">
        {initials(f.name)}
      </span>

      <AnimatePresence>
        {!broken[f.photo] && (
          <motion.img
            key={f.photo}
            src={asset(f.photo)}
            alt={`${f.name}, ${f.role} de TTP Creators`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onError={() => setBroken((b) => ({ ...b, [f.photo]: true }))}
          />
        )}
      </AnimatePresence>

      <motion.span
        className="about-caption"
        key={`caption-${idx}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {f.name} — {f.role}
      </motion.span>

      <span className="about-dots" aria-hidden="true">
        {FOUNDERS.map((x, i) => (
          <i key={x.name} className={i === idx ? 'on' : ''} />
        ))}
      </span>
    </Reveal>
  )
}

export default function About() {
  return (
    <section className="sec" id="about">
      <div className="wrap">
        <Eyebrow n="01">À propos</Eyebrow>
        <div className="about-grid">
          <FounderPhoto />
          <Reveal className="about-txt" delay={0.1}>
            <h2 className="about-title">
              Une agence pensée comme un studio,
              <br />
              au service des créatrices.
            </h2>
            <p className="lead">
              TTP Creators structure les talents, construit leur image et négocie leurs
              partenariats. Une seule équipe, de la stratégie à la production — entre{' '}
              <Tooltip content="Deux villes, deux marchés : la France et la Suisse. Campagnes locales ou activations internationales, nos créatrices couvrent les deux.">
                <b className="tt-word">Lyon et Genève</b>
              </Tooltip>
              .
            </p>
            <div className="pillars">
              {PILLARS.map((p, i) => (
                <div className="pillar" key={p.title}>
                  <span className="pillar-n">0{i + 1}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
