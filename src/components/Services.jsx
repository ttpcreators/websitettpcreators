import Reveal, { Eyebrow } from './Reveal.jsx'
import PlatformStage from './PlatformStage.jsx'
import { SERVICES, PLATFORMS } from '../data.js'

export default function Services() {
  return (
    <section className="sec" id="services">
      <div className="wrap">
        <Eyebrow n="02">Services</Eyebrow>
        <Reveal>
          <h2 className="sec-title sec-title-wide">
            « Un accompagnement complet,
            <br />
            du talent à la marque. »
          </h2>
        </Reveal>

        <div className="bento">
          {SERVICES.map((s, i) => (
            <Reveal className={`svc${s.big ? ' svc-big' : ''}`} key={s.title} delay={i * 0.06}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <div className="tags">
                {s.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="svc svc-plat" delay={0.1}>
            <PlatformStage />
            <div className="plat-txt">
              <h3>Un seul talent, plusieurs terrains de jeu.</h3>
              <p>
                Instagram, TikTok, YouTube, Snapchat, Twitch. Chaque créatrice a ses plateformes —
                on l'accompagne là où elle performe.
              </p>
              <div className="tags">
                {PLATFORMS.map((p) => (
                  <span className="tag" key={p}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
