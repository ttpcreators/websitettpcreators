import { motion } from 'motion/react'

export const EASE = [0.16, 1, 0.3, 1]

// Bloc qui apparaît en glissant vers le haut quand il entre dans le viewport.
export default function Reveal({ children, delay = 0, y = 18, className, ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

// Petit label de section : (01) — À propos
export function Eyebrow({ n, children }) {
  return (
    <Reveal className="eyebrow">
      <b>({n})</b>
      <i />
      {children}
    </Reveal>
  )
}
