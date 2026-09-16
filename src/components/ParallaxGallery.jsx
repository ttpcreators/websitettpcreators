import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { asset } from '../data.js'

// Galerie parallax au scroll — porté depuis le composant GSAP/ScrollTrigger
// + Lenis (Osmo) vers motion (useScroll/useTransform) : même effet de
// profondeur « scrubbé » par le scroll, zéro dépendance ajoutée, pas de
// détournement du scroll global. Vitesses des couches fidèles à l'original
// (yPercent 70 / 55 / 40 / 10, de l'arrière vers l'avant).

const PHOTOS = {
  back1: { src: 'assets/creators/mathilde.jpg', alt: 'Mathilde Viot' },
  back2: { src: 'assets/creators/margaux.jpg', alt: 'Margaux Bekhdadi' },
  mid: { src: 'assets/creators/candice.jpg', alt: 'Candice Maissa' },
  front: { src: 'assets/creators/lena.jpg', alt: 'Léna Pasquale' },
}

export default function ParallaxGallery() {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  // progression : 0 quand le haut de la section touche le haut du viewport,
  // 1 quand son bas l'atteint (équivalent du trigger 0%/100% de l'original)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const yBack = useTransform(scrollYProgress, [0, 1], ['0%', '70%'])
  const yMid = useTransform(scrollYProgress, [0, 1], ['0%', '55%'])
  const yTitle = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const yFront = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  const layerStyle = (y) => (reduce ? undefined : { y })

  return (
    <section className="plx" ref={ref} aria-label="Les créatrices TTP en images">
      <div className="plx-visuals">
        {/* couche arrière — la plus « lente » à quitter le cadre */}
        <motion.div className="plx-layer" style={layerStyle(yBack)}>
          <img className="plx-img plx-back1" src={asset(PHOTOS.back1.src)} alt={PHOTOS.back1.alt} loading="lazy" />
          <img className="plx-img plx-back2" src={asset(PHOTOS.back2.src)} alt={PHOTOS.back2.alt} loading="lazy" />
        </motion.div>

        {/* couche intermédiaire */}
        <motion.div className="plx-layer" style={layerStyle(yMid)}>
          <img className="plx-img plx-mid" src={asset(PHOTOS.mid.src)} alt={PHOTOS.mid.alt} loading="lazy" />
        </motion.div>

        {/* titre entre les photos */}
        <motion.div className="plx-layer plx-title-layer" style={layerStyle(yTitle)}>
          <h2 className="plx-title">
            Creators<span className="hh-grad">.</span>
          </h2>
        </motion.div>

        {/* couche avant — file la première */}
        <motion.div className="plx-layer" style={layerStyle(yFront)}>
          <img className="plx-img plx-front" src={asset(PHOTOS.front.src)} alt={PHOTOS.front.alt} loading="lazy" />
        </motion.div>

        <div className="plx-fade" aria-hidden="true" />
      </div>
    </section>
  )
}
