import { motion } from 'motion/react'

// « Border beam » : un segment dégradé qui parcourt le contour du bouton
// en continu. Le double masque (padding-box / border-box + intersect) ne
// laisse visible que l'anneau de bordure. Porté depuis la version
// shadcn/Tailwind vers le stack du site (CSS pur, classes .bb-*).
// À placer DANS un élément en position:relative (les .btn le sont).
export default function BorderBeam({ size = 20, duration = 5, radius = 22, color = '#8c1d3f' }) {
  return (
    <div className="bb" aria-hidden="true">
      <motion.div
        className="bb-beam"
        animate={{ offsetDistance: ['0%', '100%'] }}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          background: `linear-gradient(to right, transparent, ${color}, ${color})`,
        }}
        transition={{ repeat: Infinity, duration, ease: 'linear' }}
      />
    </div>
  )
}
