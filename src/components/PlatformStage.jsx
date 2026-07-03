import { useEffect } from 'react'
import { animate, motion } from 'motion/react'
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  SnapchatIcon,
  TwitchIcon,
} from './icons.jsx'

// Scène animée des plateformes (portée depuis aceternity cards-demo-3) :
// les cercles pulsent en séquence, un faisceau bordeaux balaie la rangée,
// des étincelles scintillent le long du faisceau. Logos = les officiels.

const scale = [1, 1.1, 1]
const transform = ['translateY(0px)', 'translateY(-4px)', 'translateY(0px)']
const SEQUENCE = [1, 2, 3, 4, 5].map((i) => [
  `.pl-circle-${i}`,
  { scale, transform },
  { duration: 0.8 },
])

function Sparkles() {
  const randomMove = () => Math.random() * 2 - 1
  const randomOpacity = () => Math.random()
  const random = () => Math.random()
  return (
    <div className="pl-sparkles" aria-hidden="true">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 2 + 4,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: 2,
            height: 2,
            borderRadius: '50%',
            zIndex: 1,
            background: 'rgba(11, 11, 13, 0.8)',
          }}
        />
      ))}
    </div>
  )
}

export default function PlatformStage() {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduce) return
    const controls = animate(SEQUENCE, { repeat: Infinity, repeatDelay: 1 })
    return () => controls.stop()
  }, [reduce])

  return (
    <div className="pl-skeleton" aria-hidden="true">
      <div className="pl-row">
        <div className="pl-circle pl-circle-1 pl-sm">
          <InstagramIcon size={15} />
        </div>
        <div className="pl-circle pl-circle-2 pl-md">
          <TikTokIcon size={20} />
        </div>
        <div className="pl-circle pl-circle-3 pl-lg">
          <YouTubeIcon size={30} />
        </div>
        <div className="pl-circle pl-circle-4 pl-md">
          <SnapchatIcon size={22} />
        </div>
        <div className="pl-circle pl-circle-5 pl-sm">
          <TwitchIcon size={15} />
        </div>
      </div>

      <div className="pl-beam">{!reduce && <Sparkles />}</div>
    </div>
  )
}
