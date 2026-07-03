import * as React from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'

/* ------------------------------------------------------------------
   Moteur de dessin : chaque tracé anime son `pathLength` de 0 → 1
   (le trait se peint), puis s'arrête. Au repos, tout est dessiné.
   <Highlight> suit le survol/focus et propage l'état via DrawContext.
   Porté depuis la version shadcn/Tailwind vers le stack du site
   (JSX + CSS pur, classes .aht-* dans App.css, motion/react).
   ------------------------------------------------------------------ */

const DrawContext = React.createContext('rest')

const cx = (...cls) => cls.filter(Boolean).join(' ')

const drawVariants = (delay = 0, duration = 0.55) => ({
  rest: { pathLength: 1, opacity: 1 },
  draw: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration, ease: 'easeInOut', delay },
      opacity: { duration: 0.12, delay },
    },
  },
})

/** Un trait qui se peint quand le highlight est actif. */
function DrawPath({ d, delay = 0, duration = 0.55 }) {
  const state = React.useContext(DrawContext)
  return (
    <motion.path d={d} variants={drawVariants(delay, duration)} initial="rest" animate={state} />
  )
}

function IconBase({ className, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx('aht-icon', className)}
    >
      {children}
    </svg>
  )
}

/* ---------------- icônes : chaque trait se redessine au survol ----- */

const HEART_D =
  'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z'

const FILL_REVEAL = {
  rest: { opacity: 1 },
  draw: {
    opacity: [0, 0, 1],
    transition: { duration: 0.75, times: [0, 0.62, 1], ease: 'easeOut' },
  },
}

export function HeartIcon({ className }) {
  const state = React.useContext(DrawContext)
  return (
    <IconBase className={className}>
      <motion.path
        d={HEART_D}
        fill="currentColor"
        stroke="none"
        variants={FILL_REVEAL}
        initial="rest"
        animate={state}
      />
      <DrawPath d={HEART_D} duration={0.6} />
    </IconBase>
  )
}

export function SparklesIcon({ className }) {
  return (
    <IconBase className={className}>
      <DrawPath
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0Z"
        duration={0.6}
      />
      <DrawPath d="M20 3v4" delay={0.45} duration={0.2} />
      <DrawPath d="M22 5h-4" delay={0.5} duration={0.2} />
      <DrawPath d="M4 17v2" delay={0.6} duration={0.2} />
      <DrawPath d="M5 18H3" delay={0.65} duration={0.2} />
    </IconBase>
  )
}

export function MousePointerClickIcon({ className }) {
  return (
    <IconBase className={className}>
      <DrawPath
        d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074Z"
        duration={0.5}
      />
      <DrawPath d="M14 4.1 12 6" delay={0.42} duration={0.22} />
      <DrawPath d="m5.1 8-2.9-.8" delay={0.48} duration={0.22} />
      <DrawPath d="m6 12-1.9 2" delay={0.54} duration={0.22} />
      <DrawPath d="M7.2 2.2 8 5.1" delay={0.6} duration={0.22} />
    </IconBase>
  )
}

export function RocketIcon({ className }) {
  return (
    <IconBase className={className}>
      <DrawPath
        d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
        duration={0.55}
      />
      <DrawPath d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" delay={0.35} duration={0.3} />
      <DrawPath d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" delay={0.45} duration={0.3} />
      <DrawPath
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
        delay={0.7}
        duration={0.3}
      />
    </IconBase>
  )
}

/* ---------------- Highlight ---------------------------------------- */

export function Highlight({
  children,
  icon,
  color,
  iconPosition = 'before',
  image,
  imageAlt = '',
  autoPlay = false,
  className,
  ...props
}) {
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState(autoPlay)
  const tipId = React.useId()
  const ref = React.useRef(null)

  /* le tooltip suit le curseur en coordonnées LOCALES (offset depuis le
     bord gauche du highlight) — pas de portal ni de calcul viewport */
  const mvLeft = useMotionValue(0)
  const left = useSpring(mvLeft, { stiffness: 700, damping: 45, mass: 0.5 })

  const pointTo = (clientX, snap = false) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const lx = clientX - rect.left
    mvLeft.set(lx)
    if (snap) left.jump(lx)
  }

  const focusCenter = (snap = false) => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) pointTo(rect.left + rect.width / 2, snap)
  }

  const state = !reduce && (autoPlay || active) ? 'draw' : 'rest'

  /* le mot reste du texte inline (même ligne de base que le paragraphe) ;
     seule l'icône est inline-block, l'espacement vit sur l'icône */
  const spacing = iconPosition === 'before' ? 'aht-icon-before' : 'aht-icon-after'
  const renderedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon, { className: cx(spacing, icon.props.className) })
    : icon && <span className={cx('aht-icon-fallback', spacing)}>{icon}</span>

  /* surlignage façon marqueur : teinte accent si color est fournie,
     sinon lavis neutre via la classe hover */
  const style = {}
  if (color) {
    style.color = color
    style.backgroundColor = active ? `${color}22` : 'transparent'
  }

  return (
    <span
      ref={ref}
      className={cx('aht-hl', !color && 'aht-hl-neutral', className)}
      style={style}
      tabIndex={0}
      aria-describedby={image && active ? tipId : undefined}
      onMouseEnter={(e) => {
        pointTo(e.clientX, true)
        setActive(true)
      }}
      onMouseMove={(e) => pointTo(e.clientX)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => {
        focusCenter(true)
        setActive(true)
      }}
      onBlur={() => setActive(false)}
      {...props}
    >
      <DrawContext.Provider value={state}>
        {iconPosition === 'before' ? renderedIcon : null}
        {children}
        {iconPosition === 'after' ? renderedIcon : null}
      </DrawContext.Provider>

      {/* tooltip image — ancré au-dessus du mot, suit le x du curseur */}
      {image ? (
        <AnimatePresence>
          {active ? (
            <motion.span key="tip" role="tooltip" id={tipId} className="aht-tip" style={{ left }}>
              <motion.span
                className="aht-tip-inner"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
                transition={{ type: 'spring', stiffness: 460, damping: 30 }}
              >
                <span className="aht-tip-card">
                  <img src={image} alt={imageAlt} loading="lazy" />
                </span>
                <span className="aht-tip-arrow" />
              </motion.span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      ) : null}
    </span>
  )
}

/* ---------------- AnimatedHighlightText ---------------------------- */

/**
 * Bloc typographique mêlant texte courant et <Highlight> :
 * chaque highlight porte une icône qui se redessine au survol/focus.
 */
export default function AnimatedHighlightText({ children, as: Tag = 'p', className, ...props }) {
  return (
    <Tag className={cx('aht-text', className)} {...props}>
      {children}
    </Tag>
  )
}
