import { ArrowUpRight } from 'lucide-react'
import { NAV_LINKS, SOCIALS, CONTACT_EMAIL, asset } from '../data.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a href="#hero" aria-label="TTP Creators, retour en haut">
            <img src={asset('assets/logo-dark.png')} alt="TTP Creators" className="footer-logo" />
          </a>
          <p className="footer-tag">
            Talent management Sport &amp; Lifestyle, entre Lyon et Genève. Trust the Process.
          </p>
          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label} <ArrowUpRight size={14} strokeWidth={2.5} />
              </a>
            ))}
          </div>
        </div>

        <nav className="footer-nav" aria-label="Pied de page">
          <div>
            <span>Agence</span>
            <a href="#about">À propos</a>
            <a href="#story">Notre histoire</a>
            <a href="#method">Méthode</a>
          </div>
          <div>
            <span>Talents</span>
            <a href="#roster">Le roster</a>
            <a href="#services">Services</a>
          </div>
          <div>
            <span>Contact</span>
            <a href={`mailto:${CONTACT_EMAIL}`}>Email</a>
            <a href="#contact">Formulaire</a>
          </div>
        </nav>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 TTP Creators. Tous droits réservés.</span>
        <span>Lyon · Genève</span>
      </div>
    </footer>
  )
}
