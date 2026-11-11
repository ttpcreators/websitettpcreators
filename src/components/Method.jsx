import Reveal, { Eyebrow } from './Reveal.jsx'
import { STEPS } from '../data.js'

export default function Method() {
  return (
    <section className="sec" id="method">
      <div className="wrap">
        <Eyebrow n="02">Pour les marques</Eyebrow>
        <Reveal>
          <h2 className="sec-title">
            Une campagne avec TTP,
            <br />
            en quatre étapes.
          </h2>
        </Reveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal className="step" key={s.title} delay={i * 0.08}>
              <div className="step-n">0{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
