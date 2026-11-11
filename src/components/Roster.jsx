import { useEffect, useMemo, useState } from 'react'
import RosterDome from './RosterDome.jsx'
import { ROSTER_FALLBACK, asset } from '../data.js'
import { fetchRoster, fetchMediakitSlugs } from '../lib/roster.js'
import { titleCase, displayName } from '../lib/format.js'

export default function Roster({ ready = true }) {
  const [rows, setRows] = useState(null)
  const [slugs, setSlugs] = useState(null)

  // Roster live depuis Supabase ; en cas d'échec, la liste statique reste affichée.
  useEffect(() => {
    const ctrl = new AbortController()
    fetchRoster(ctrl.signal)
      .then(setRows)
      .catch(() => {})
    // adresses des media kits : sans elles, les cartes du dôme ne sont pas cliquables
    fetchMediakitSlugs(ctrl.signal)
      .then(setSlugs)
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  const creators = useMemo(() => {
    if (!rows) return ROSTER_FALLBACK.map((c) => ({ ...c, realName: c.name, name: displayName(c.name), photo: asset(c.photo) }))
    return rows.map((r) => {
      const canonical = titleCase(r.name) // nom réel → sert à retrouver la fiche fallback
      const local = ROSTER_FALLBACK.find((f) => f.name.toLowerCase() === canonical.toLowerCase())
      return {
        realName: canonical, // nom réel → sert au lien du media kit (/mediakit/<prénom>/)
        name: displayName(r.name), // nom AFFICHÉ (avec override éventuel, ex. Lucie Bots)
        platform: r.platform || '',
        slug: slugs?.[String(r.name || '').toLowerCase().trim()] || null,
        handle: r.handle || local?.handle || '',
        niche: r.niche || local?.niche || '',
        photo: r.photo_url || (local ? asset(local.photo) : null),
      }
    })
  }, [rows, slugs])

  const count = creators.length

  return (
    <section className="sec" id="roster">
      <div className="wrap">
        <p className="tb-mono dome-bar">
          <span>
            (01) Le roster — {count} créateur{count > 1 ? 's' : ''} sport &amp; lifestyle
          </span>
          <span className="dome-bar-hint">Glissez pour explorer · Cliquez pour voir le media kit</span>
        </p>
      </div>
      <RosterDome creators={creators} ready={ready} />
    </section>
  )
}
