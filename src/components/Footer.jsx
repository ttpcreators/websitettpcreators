import { SOCIALS, CONTACT_EMAIL } from '../data.js'

// Footer façon template « Ollef » : fond sombre, grand appel à l'action,
// colonnes de liens, logotype géant coupé par le bas de page.

const SITEMAP = [
  { href: '#about', label: 'À propos' },
  { href: '#services', label: 'Services' },
  { href: '#roster', label: 'Roster' },
  { href: '#story', label: 'Notre histoire' },
  { href: '#contact', label: 'Contact' },
]

export default function Footer() {
  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="footer2">
      <div className="wrap">
        <div className="f2-cta">
          <h2 className="f2-title">
            Prêts à construire des
            <br />
            collaborations qui marquent&nbsp;?
          </h2>
          <a className="f2-touch" href="#contact">
            Contactez-nous
          </a>
        </div>

        <hr className="f2-rule" />

        <div className="f2-cols">
          <nav aria-label="Plan du site">
            <span className="f2-col-title">Plan du site</span>
            {SITEMAP.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div>
            <span className="f2-col-title">Réseaux</span>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
          </div>
          <div>
            <span className="f2-col-title">Contact</span>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <span className="f2-plain">Lyon · Genève</span>
          </div>
        </div>

        <div className="f2-bottom">
          <button type="button" className="f2-top" onClick={backToTop}>
            Retour en haut ↑
          </button>
          <span className="f2-copy">© TTP Creators {new Date().getFullYear()}</span>
        </div>
      </div>

      <div className="f2-mark" aria-hidden="true">
        TTP<span className="f2-r">®</span>
      </div>
    </footer>
  )
}
