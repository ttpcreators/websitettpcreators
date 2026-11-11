import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

// Menu en pilule flottant en bas de l'écran. La section visible est marquée par
// une pastille blanche qui glisse d'un lien à l'autre.

const LINKS = [
  { id: 'roster', label: 'Créateurs' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'Agence' },
  { id: 'contact', label: 'Contact' },
]

export default function PillNav() {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean)
    const seen = new Map()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting))
        // le dernier lien dont la section touche le milieu de l'écran
        const hit = LINKS.filter((l) => seen.get(l.id)).pop()
        setActive(hit ? hit.id : null)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <nav className="pn" aria-label="Navigation principale">
      {LINKS.map((l) => (
        <a key={l.id} href={`#${l.id}`} className={`pn-link${active === l.id ? ' is-on' : ''}`}>
          {active === l.id && (
            <motion.span
              layoutId="pn-pill"
              className="pn-pill"
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            />
          )}
          <span className="pn-label">{l.label}</span>
        </a>
      ))}
    </nav>
  )
}
