import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { EASE } from './Reveal.jsx'
import { asset } from '../data.js'

// Navbar façon « Ollef » : logo à gauche, liens centrés (desktop), CTA
// souligné à droite. Elle s'adapte au fond : claire sur le hero noir,
// encre sur les sections blanches (bascule au scroll). Sur mobile, le
// bouton Menu ouvre l'overlay plein écran comme avant.

const CENTER_LINKS = [
  { href: '#about', label: 'À propos' },
  { href: '#services', label: 'Services' },
  { href: '#roster', label: 'Roster' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar({ menuOpen, onToggleMenu }) {
  const [overHero, setOverHero] = useState(true)

  useEffect(() => {
    const onScroll = () => setOverHero(window.scrollY < window.innerHeight * 0.82)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // L'overlay du menu est blanc : la nav repasse en encre quand il est ouvert.
  const dark = overHero && !menuOpen

  return (
    <motion.nav
      className={`navbar${dark ? ' navbar-dark' : ''}`}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="nav-left">
        <a className="brand" href="#hero" aria-label="TTP Creators, accueil">
          <img
            src={asset(dark ? 'assets/logo-light.png' : 'assets/logo-dark.png')}
            alt="TTP Creators"
            className="brand-logo"
          />
        </a>

        <button
          className="menu-btn"
          type="button"
          onClick={onToggleMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <span className="menu-btn-circle">
            <motion.span
              className="menu-btn-plus"
              animate={{ rotate: menuOpen ? 45 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Plus size={12} strokeWidth={3} />
            </motion.span>
          </span>
          <span className="menu-btn-label">{menuOpen ? 'Fermer' : 'Menu'}</span>
        </button>
      </div>

      <div className="nav-center" aria-label="Navigation principale">
        {CENTER_LINKS.map((l) => (
          <a key={l.href} href={l.href} className="nav-link">
            {l.label}
          </a>
        ))}
      </div>

      <div className="nav-right">
        <a className="nav-cta2" href="#contact">
          Travailler avec nous
        </a>
      </div>
    </motion.nav>
  )
}
