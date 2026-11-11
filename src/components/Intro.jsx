import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { asset } from '../data.js'

// Animation d'ouverture : sur un papier blanc cassé (la couleur du mur du
// studio), le monogramme TTP se dévoile de bas en haut, « Trust The Process »
// s'écrit lettre à lettre dessous en petites capitales espacées, un filet se
// trace, puis le rideau se lève sur le studio. Une seule couleur (bordeaux),
// ~2,6 s, une fois par visite, un clic la passe.

const WORDS = 'Trust The Process'
const EASE = [0.22, 1, 0.36, 1]

export default function Intro({ onDone }) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 2500)
    return () => clearTimeout(t)
  }, [])

  // le site s'anime pendant que le rideau se lève (pas après)
  useEffect(() => {
    if (!open) onDone()
  }, [open, onDone])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="intro"
          onClick={() => setOpen(false)}
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <motion.div
            className="intro-inner"
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <motion.img
              className="intro-logo"
              src={asset('assets/logo-dark.png')}
              alt=""
              initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.08, filter: 'blur(6px)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, ease: EASE }}
            />
            <p className="intro-words">
              {WORDS.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.035, duration: 0.5, ease: EASE }}
                >
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </p>
            <motion.span
              className="intro-rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 1.1, ease: EASE }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
