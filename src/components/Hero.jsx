import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { STATS } from '../data.js'

// Ouverture (maquette « dôme », version blanche) : on dit tout de suite ce que
// fait TTP, en une phrase, puis on parle aux deux publics (marques / créateurs)
// avec chacun son bouton, et quelques preuves chiffrées.

const EASE = [0.22, 1, 0.36, 1]

const AUDIENCES = [
  {
    who: 'Vous êtes une marque',
    text: "On vous propose les créateurs qui parlent à votre cible, on cadre le brief et le contrat, on suit les publications et on vous rend les chiffres.",
    cta: 'Voir nos créateurs',
    href: '#roster',
  },
  {
    who: 'Vous êtes créateur',
    text: "On gère vos partenariats, vos tarifs et votre image. Vous vous concentrez sur vos contenus, on s'occupe du reste.",
    cta: "Rejoindre l'agence",
    href: '#contact',
  },
]

const pad = (n, p = 0) => String(n).padStart(p, '0')

export default function Hero() {
  const reduce = useReducedMotion()
  const rise = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 1, ease: EASE },
        }

  const proof = [STATS[2], STATS[0]].filter(Boolean)

  return (
    <section className="hero hx" id="hero">
      <motion.p className="tb-mono hx-kicker" {...rise(0.1)}>
        (Agence de talents) — Sport &amp; Lifestyle — Lyon · Genève
      </motion.p>

      <h1 className="hx-title">
        <motion.span className="hx-line" {...rise(0.2)}>
          On représente des créateurs sport&nbsp;&amp;&nbsp;lifestyle
        </motion.span>{' '}
        <motion.span className="hx-line hx-soft" {...rise(0.32)}>
          et on les fait travailler avec les marques.
        </motion.span>
      </h1>

      <div className="hx-grid">
        {AUDIENCES.map((a, i) => (
          <motion.a key={a.who} className="hx-card" href={a.href} {...rise(0.5 + i * 0.1)}>
            <span className="tb-mono hx-who">{a.who}</span>
            <span className="hx-text">{a.text}</span>
            <span className="hx-cta">
              {a.cta}
              <ArrowUpRight size={16} strokeWidth={2} />
            </span>
          </motion.a>
        ))}

        <motion.ul className="hx-proof" {...rise(0.7)} aria-label="En chiffres">
          {proof.map((s) => (
            <li key={s.label}>
              <b>
                {s.prefix || ''}
                {pad(s.target, s.pad)}
                {s.suffix || ''}
              </b>
              <span className="tb-mono">{s.label}</span>
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.div className="hx-foot" {...rise(0.9)}>
        <span className="tb-mono">Trust The Process.</span>
        <a className="tb-mono hx-scroll" href="#roster">
          Découvrir le roster ↓
        </a>
      </motion.div>
    </section>
  )
}
