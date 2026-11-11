import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { EASE } from './Reveal.jsx'
import { asset } from '../data.js'

// Barre du haut (maquette « dôme ») : logo seul à gauche, phrase de l'agence et
// heure en direct des deux bureaux en petits caractères machine, bouton pilule
// « Parlons-en » à droite. La navigation passe dans la pilule en bas (PillNav).

const OFFICES = [
  { city: 'Lyon, FR', tz: 'Europe/Paris' },
  { city: 'Genève, CH', tz: 'Europe/Zurich' },
]

function timeIn(tz, now) {
  const hm = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now)
  const off = new Intl.DateTimeFormat('en-GB', { timeZone: tz, timeZoneName: 'shortOffset' })
    .formatToParts(now)
    .find((p) => p.type === 'timeZoneName')?.value
  return `${hm} ${off || ''}`.trim()
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    // recale sur la minute pile, puis une fois par minute
    let id
    const t = setTimeout(() => {
      setNow(new Date())
      id = setInterval(() => setNow(new Date()), 60000)
    }, 60000 - (Date.now() % 60000))
    return () => {
      clearTimeout(t)
      clearInterval(id)
    }
  }, [])
  return now
}

export default function Navbar() {
  const now = useNow()
  return (
    <motion.header
      className="navbar tb"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <a className="brand" href="#hero" aria-label="TTP Creators, accueil">
        <img src={asset('assets/logo-dark.png')} alt="TTP Creators" className="brand-logo" />
      </a>

      <p className="tb-mono tb-statement">
        TTP Creators est une agence de talents sport &amp; lifestyle qui relie les bons créateurs
        aux bonnes marques.
      </p>

      <ul className="tb-mono tb-clocks" aria-label="Heure dans nos bureaux">
        {OFFICES.map((o, i) => (
          <li key={o.city} className={i ? 'is-dim' : ''}>
            <span className="tb-dot" aria-hidden="true" />
            {o.city}
            <br />
            {timeIn(o.tz, now)}
          </li>
        ))}
      </ul>

      <a className="tb-cta" href="#contact">
        Parlons-en
      </a>
    </motion.header>
  )
}
