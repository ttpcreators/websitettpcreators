import Reveal from './Reveal.jsx'
import AnimatedHighlightText, {
  Highlight,
  MousePointerClickIcon,
  HeartIcon,
  RocketIcon,
} from './AnimatedHighlightText.jsx'
import { asset } from '../data.js'

// Phrase-manifeste : survole (ou touche) les mots surlignés —
// l'icône se redessine et une photo du roster apparaît en tooltip.
export default function Manifesto() {
  return (
    <section className="sec manifesto" aria-label="Notre conviction">
      <div className="wrap">
        <Reveal>
          <AnimatedHighlightText className="manifesto-text">
            Le talent brut ne suffit pas. Ce qui fait la différence : une image{' '}
            <Highlight
              icon={<MousePointerClickIcon />}
              image={asset('assets/creators/candice.jpg')}
              imageAlt="Candice Maissa"
            >
              construite
            </Highlight>
            , une communauté{' '}
            <Highlight
              icon={<HeartIcon />}
              color="#8c1d3f"
              image={asset('assets/creators/beverly.jpg')}
              imageAlt="Beverly Filoni"
            >
              engagée
            </Highlight>
            , des campagnes{' '}
            <Highlight
              icon={<RocketIcon />}
              image={asset('assets/creators/lena.jpg')}
              imageAlt="Léna Pasquale"
            >
              lancées
            </Highlight>{' '}
            au bon moment.
          </AnimatedHighlightText>
        </Reveal>
      </div>
    </section>
  )
}
