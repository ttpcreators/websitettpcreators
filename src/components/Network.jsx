import Reveal, { Eyebrow } from './Reveal.jsx'
import DottedGlobe from './DottedGlobe.jsx'

export default function Network() {
  return (
    <section className="sec" id="network">
      <div className="wrap">
        <Eyebrow n="04">Notre réseau</Eyebrow>
        <div className="net-grid">
          <Reveal className="net-txt">
            <h2>
              De Lyon &amp; Genève,
              <br />
              on connecte les talents au monde.
            </h2>
            <p className="lead">
              Nos créatrices collaborent avec des marques partout dans le monde. Campagnes locales
              ou activations internationales, on relie les bons talents aux bons marchés.
            </p>
          </Reveal>
          <Reveal className="net-viz" delay={0.1}>
            <DottedGlobe width={520} height={520} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
