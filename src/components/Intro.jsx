import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

// Animation d'ouverture : « Trust The Process. » tapé lettre à lettre, les lettres
// autres que les initiales se replient pour ne laisser que « TTP », puis le rideau
// blanc se lève sur le site. ~2,6 s, une seule fois par visite, un clic la passe,
// et rien du tout si le visiteur a demandé moins d'animations.

const TEXT = 'Trust The Process.'
const INITIALS = new Set([0, 6, 10]) // T, T, P
const TYPE_MS = 55

export default function Intro({ onDone }) {
  const [step, setStep] = useState(0) // lettres tapées
  const [fold, setFold] = useState(false) // repli vers « TTP »
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const timers = []
    for (let i = 1; i <= TEXT.length; i++) timers.push(setTimeout(() => setStep(i), 200 + i * TYPE_MS))
    const typed = 200 + TEXT.length * TYPE_MS
    timers.push(setTimeout(() => setFold(true), typed + 350))
    timers.push(setTimeout(() => setOpen(false), typed + 1250))
    return () => timers.forEach(clearTimeout)
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
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <p className={`intro-word${fold ? ' is-fold' : ''}`}>
            {TEXT.split('').map((ch, i) => {
              const keep = INITIALS.has(i)
              return (
                <span
                  key={i}
                  className={`intro-ch${keep ? ' is-key' : ''}${i < step ? ' is-on' : ''}`}
                >
                  {ch === ' ' ? ' ' : ch}
                </span>
              )
            })}
            <span className={`intro-caret${fold ? ' is-off' : ''}`} />
          </p>
          <span className="tb-mono intro-tag">TTP Creators — Lyon · Genève</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
