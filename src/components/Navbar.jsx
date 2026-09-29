import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { EASE } from './Reveal.jsx'
import { asset } from '../data.js'

// Navbar façon « Ollef » en clair : logo à gauche, liens centrés (desktop),
// CTA souligné à droite. Sur mobile, le bouton Menu ouvre l'overlay.

const CENTER_LINKS = [
  { href: '#about', label: 'À propos' },
  { href: '#services', label: 'Services' },
  { href: '#roster', label: 'Roster' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar({ menuOpen, onToggleMenu }) {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="nav-left">
        <a className="brand" href="#hero" aria-label="TTP Creators, accueil">
          <img src={asset('assets/logo-dark.png')} alt="TTP Creators" className="brand-logo" />
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
