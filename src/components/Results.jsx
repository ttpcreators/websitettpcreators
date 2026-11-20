import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Reveal, { Eyebrow } from './Reveal.jsx'
import BorderBeam from './BorderBeam.jsx'
import { CONTACT_EMAIL, RESULTS, ROSTER_DECK_URL, SITE_LEAD_URL } from '../data.js'

// Section « Résultats » + formulaire « Recevoir le roster » (stratégie du 20/11/2026).
// L'envoi crée un contact et une tâche dans TTP Suite (fonction site-lead) ; le lien du
// roster s'affiche tout de suite. En cas d'échec : repli mailto.
export default function Results() {
  const [etat, setEtat] = useState(null) // null | 'envoi' | 'ok' | { erreur }
  const [roster, setRoster] = useState(ROSTER_DECK_URL)

  const onSubmit = async (ev) => {
    ev.preventDefault()
    const data = new FormData(ev.currentTarget)
    const email = String(data.get('email') || '').trim()
    const marque = String(data.get('marque') || '').trim()
    const message = String(data.get('besoin') || '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !marque) {
      setEtat({ erreur: 'Indiquez votre marque et un email professionnel valide.' })
      return
    }
    setEtat('envoi')
    try {
      const res = await fetch(SITE_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, marque, message, site: String(data.get('site') || '') }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'erreur')
      if (j.roster) setRoster(j.roster)
      setEtat('ok')
    } catch {
      const subject = encodeURIComponent(`Recevoir le roster — ${marque}`)
      const body = encodeURIComponent(`Marque : ${marque}\nEmail : ${email}${message ? `\n\n${message}` : ''}`)
      setEtat({ erreur: 'Envoi impossible pour l’instant : ouverture de votre client mail.' })
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    }
  }

  return (
    <section className="sec" id="resultats">
      <div className="wrap">
        <Eyebrow n="07">Résultats</Eyebrow>
        <Reveal>
          <h2>Des campagnes qui se mesurent.</h2>
          <p className="lead res-lead">
            Ventes, interactions, partenariats renouvelés : ce que nos créateurs apportent aux marques.
          </p>
        </Reveal>

        <div className="res-grid">
          {RESULTS.map((r, i) => (
            <Reveal className="res-card" key={r.brand} delay={i * 0.06}>
              <span className="res-brand">{r.brand}</span>
              <b className="res-fig">{r.figure}</b>
              <span className="res-label">{r.label}</span>
              <p>{r.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="res-cta">
          <div className="res-cta-l">
            <h3>Recevoir le roster</h3>
            <p>Les profils disponibles, leurs chiffres à jour et leurs tarifs agence. On vous répond sous 24 h.</p>
          </div>
          {etat === 'ok' ? (
            <div className="res-ok" role="status">
              <p>Merci, c’est noté. Le roster est déjà là :</p>
              <a className="btn btn-dark" href={roster} target="_blank" rel="noreferrer">
                Voir le roster <ArrowUpRight size={16} strokeWidth={2.5} />
              </a>
            </div>
          ) : (
            <form className="res-form" onSubmit={onSubmit} noValidate>
              <div className="hp" aria-hidden="true">
                <label>
                  Ne pas remplir
                  <input type="text" name="site" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <div className="frow">
                <label className="field">
                  <span>Marque</span>
                  <input name="marque" type="text" required autoComplete="organization" />
                </label>
                <label className="field">
                  <span>Email pro</span>
                  <input name="email" type="email" required autoComplete="email" />
                </label>
              </div>
              <label className="field">
                <span>Votre besoin (facultatif)</span>
                <input name="besoin" type="text" placeholder="Lancement, date, budget…" />
              </label>
              <div className="frow-end">
                <button type="submit" className="btn btn-dark btn-wide" disabled={etat === 'envoi'}>
                  {etat === 'envoi' ? 'Envoi…' : 'Recevoir le roster'} <ArrowUpRight size={16} strokeWidth={2.5} />
                  <BorderBeam color="#e39aa8" />
                </button>
                {etat && etat.erreur && (
                  <span className="form-note form-note-err" role="status">
                    {etat.erreur}
                  </span>
                )}
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
