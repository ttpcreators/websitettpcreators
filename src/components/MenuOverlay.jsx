import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { EASE } from './Reveal.jsx'
import { NAV_LINKS, SOCIALS, CONTACT_EMAIL } from '../data.js'

export default function MenuOverlay({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <nav className="overlay-links" aria-label="Menu principal">
            {NAV_LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={onClose}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.7, ease: EASE }}
              >
                <span className="overlay-n">0{i + 1}</span>
                {l.label}
              </motion.a>
            ))}
          </nav>

          <motion.div
            className="overlay-foot"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: EASE }}
          >
            <a className="overlay-mail" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            <div className="overlay-socials">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label} <ArrowUpRight size={14} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
