import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Reveal, { Eyebrow } from './Reveal.jsx'
import BorderBeam from './BorderBeam.jsx'
import AiLoader from './AiLoader.jsx'
import { CONTACT_EMAIL } from '../data.js'

// Pour activer l'envoi direct (sans client mail), créer un formulaire sur
// formspree.io et coller son URL ici. Vide = repli mailto.
const FORM_ENDPOINT = ''

export default function Contact() {
  const [profil, setProfil] = useState('Créatrice')
  const [note, setNote] = useState(null) // { ok: bool, text: string }
  const [busy, setBusy] = useState(false)

  const onSubmit = async (ev) => {
    ev.preventDefault()
    const form = ev.currentTarget
    const data = new FormData(form)

    if (String(data.get('company') || '').trim() !== '') return // honeypot

    const nom = String(data.get('nom') || '').trim()
    const email = String(data.get('email') || '').trim()
    const msg = String(data.get('message') || '').trim()
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!nom || !okEmail || !msg) {
      setNote({ ok: false, text: 'Merci de remplir tous les champs avec un email valide.' })
      return
    }

    if (!FORM_ENDPOINT) {
      const subject = encodeURIComponent(`Nouvelle demande — ${nom} (${profil})`)
      const body = encodeURIComponent(
        `Nom : ${nom}\nEmail : ${email}\nProfil : ${profil}\n\n${msg}`,
      )
      setNote({ loader: true, text: 'Ouverture de ton client mail…' })
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
      setTimeout(
        () => setNote({ ok: true, text: "Finalise l'envoi dans ton client mail." }),
        2000,
      )
      return
    }

    try {
      setBusy(true)
      setNote({ loader: true, text: 'Envoi en cours…' })
      data.set('profil', profil)
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        form.reset()
        setNote({ ok: true, text: `Merci ${nom}, message bien reçu. On revient vers toi sous 48 h.` })
      } else {
        setNote({ ok: false, text: `Une erreur est survenue. Écris-nous à ${CONTACT_EMAIL}.` })
      }
    } catch {
      setNote({ ok: false, text: `Connexion impossible. Écris-nous à ${CONTACT_EMAIL}.` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="sec" id="contact">
      <div className="wrap">
        <Reveal className="contact">
          <div className="contact-l">
            <Eyebrow n="07">Contact</Eyebrow>
            <h2>Parlons de ton projet.</h2>
            <p className="lead">
              Créatrice qui cherche une vraie structure, ou marque qui veut activer des talents :
              on répond sous 48 h.
            </p>
            <div className="contact-info">
              <a href={`mailto:${CONTACT_EMAIL}`} className="ci">
                <span>Email</span>
                <b>{CONTACT_EMAIL}</b>
              </a>
              <div className="ci">
                <span>Localisation</span>
                <b>Lyon &amp; Genève</b>
              </div>
              <div className="ci">
                <span>Disponibilité</span>
                <b>Réponse sous 48 h</b>
              </div>
            </div>
          </div>

          <form className="contact-r" onSubmit={onSubmit} noValidate>
            <div className="hp" aria-hidden="true">
              <label>
                Ne pas remplir
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="frow">
              <label className="field">
                <span>Nom</span>
                <input name="nom" type="text" required autoComplete="name" />
              </label>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
            </div>
            <div className="field">
              <span>Tu es</span>
              <div className="seg" role="group" aria-label="Ton profil">
                {['Créatrice', 'Marque'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`segb${profil === p ? ' active' : ''}`}
                    aria-pressed={profil === p}
                    onClick={() => setProfil(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span>Message</span>
              <textarea name="message" rows={4} required />
            </label>
            <div className="frow-end">
              <button type="submit" className="btn btn-dark btn-wide" disabled={busy}>
                {busy ? 'Envoi…' : 'Envoyer'} <ArrowUpRight size={16} strokeWidth={2.5} />
                <BorderBeam color="#e39aa8" />
              </button>
              {note &&
                (note.loader ? (
                  <span className="form-note" role="status">
                    <AiLoader variant="shimmer-text" text={note.text} />
                  </span>
                ) : (
                  <span className={`form-note${note.ok ? '' : ' form-note-err'}`} role="status">
                    {note.text}
                  </span>
                ))}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
