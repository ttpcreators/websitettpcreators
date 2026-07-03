import Reveal, { Eyebrow } from './Reveal.jsx'
import { Tooltip } from './TooltipCard.jsx'
import { TIMELINE, asset } from '../data.js'

// Carte tooltip de la marque (logo + baseline)
function CreatorsCard() {
  return (
    <span className="tt-brand">
      <img src={asset('assets/logo-dark.png')} alt="TTP Creators" />
      <b>TTP Creators</b>
      <span>
        Talent management Sport &amp; Lifestyle, entre Lyon et Genève. Trust the Process.
      </span>
    </span>
  )
}

export default function Story() {
  return (
    <section className="sec" id="story">
      <div className="wrap">
        <Eyebrow n="06">Notre histoire</Eyebrow>
        <div className="story-grid">
          <Reveal>
            <h2>La suite logique d'une agence de communication.</h2>
            <p className="lead">
              En 2022, on lance{' '}
              <Tooltip content="Notre agence de communication, lancée en 2022 : stratégie de marque, création et campagnes pour des marques françaises et suisses.">
                <b className="tt-word">TTP Agency</b>
              </Tooltip>
              , une agence de communication. À force de construire des marques et des campagnes,
              une évidence s'impose : ce sont désormais les créatrices et créateurs qui façonnent
              la culture.
            </p>
            <p className="lead">
              <Tooltip content={<CreatorsCard />}>
                <b className="tt-word">TTP Creators</b>
              </Tooltip>{' '}
              en est le prolongement naturel : le même savoir-faire d'agence, mis au service du
              management de talents.
            </p>
          </Reveal>
          <Reveal className="timeline" delay={0.1}>
            {TIMELINE.map((t, i) => (
              <div className="tl" key={t.year}>
                <span className={`tl-dot${i === TIMELINE.length - 1 ? ' tl-dot-now' : ''}`} />
                <div className="tl-year">{t.year}</div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
