import { useOnScreen } from '../lib/onScreen.js'

// « Border beam » : un segment dégradé qui parcourt le contour du bouton
// en continu. Le double masque (padding-box / border-box + intersect) ne
// laisse visible que l'anneau de bordure. Porté depuis la version
// shadcn/Tailwind vers le stack du site (CSS pur, classes .bb-*).
// À placer DANS un élément en position:relative (les .btn le sont).
// Animation CSS (plus de boucle JavaScript), en pause hors écran.
export default function BorderBeam({ size = 20, duration = 5, radius = 22, color = '#8c1d3f' }) {
  const [ref, on] = useOnScreen()
  return (
    <div className="bb" aria-hidden="true" ref={ref} data-paused={on ? undefined : ''}>
      <div
        className="bb-beam"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          background: `linear-gradient(to right, transparent, ${color}, ${color})`,
          animationDuration: `${duration}s`,
        }}
      />
    </div>
  )
}
