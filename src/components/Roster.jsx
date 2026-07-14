import { useEffect, useMemo, useState } from 'react'
import Reveal, { Eyebrow } from './Reveal.jsx'
import RosterCarousel from './RosterCarousel.jsx'
import { Tooltip } from './TooltipCard.jsx'
import { ROSTER_FALLBACK, asset } from '../data.js'
import { fetchRoster } from '../lib/roster.js'
import { titleCase, displayName } from '../lib/format.js'

// Mini-carte d'univers : avatars des créatrices de la niche + descriptif
function UniversCard({ creators, niche, desc }) {
  const list = creators.filter((c) => new RegExp(niche, 'i').test(c.niche))
  return (
    <span className="tt-univers">
      <span className="tt-avatars">
        {list.slice(0, 3).map((c) =>
          c.photo ? <img key={c.name} src={c.photo} alt={c.name} loading="lazy" /> : null,
        )}
      </span>
      <span className="tt-univers-txt">
        <b>
          {list.length} créatrice{list.length > 1 ? 's' : ''} {niche}
        </b>
        <span>{desc}</span>
      </span>
    </span>
  )
}

export default function Roster() {
  const [rows, setRows] = useState(null)

  // Roster live depuis Supabase ; en cas d'échec, la liste statique reste affichée.
  useEffect(() => {
    const ctrl = new AbortController()
    fetchRoster(ctrl.signal)
      .then(setRows)
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  const creators = useMemo(() => {
    if (!rows) return ROSTER_FALLBACK.map((c) => ({ ...c, name: displayName(c.name), photo: asset(c.photo) }))
    return rows.map((r) => {
      const canonical = titleCase(r.name) // nom réel → sert à retrouver la fiche fallback
      const local = ROSTER_FALLBACK.find((f) => f.name.toLowerCase() === canonical.toLowerCase())
      return {
        name: displayName(r.name), // nom AFFICHÉ (avec override éventuel, ex. Lucie Bots)
        handle: r.handle || local?.handle || '',
        niche: r.niche || local?.niche || '',
        photo: r.photo_url || (local ? asset(local.photo) : null),
      }
    })
  }, [rows])

  const count = creators.length

  return (
    <section className="sec" id="roster">
      <div className="wrap">
        <div className="roster-head">
          <div>
            <Eyebrow n="05">Le roster</Eyebrow>
            <Reveal>
              <h2 className="sec-title" style={{ marginBottom: 0 }}>
                Nos créatrices.
              </h2>
            </Reveal>
          </div>
          <Reveal className="roster-sub" delay={0.1}>
            {count === 8 ? 'Huit' : count} créatrice{count > 1 ? 's' : ''}, deux univers :{' '}
            <Tooltip
              content={
                <UniversCard
                  creators={creators}
                  niche="Sport"
                  desc="Entraînement, performance, lifestyle athlétique."
                />
              }
            >
              <b className="tt-word">Sport</b>
            </Tooltip>{' '}
            et{' '}
            <Tooltip
              content={
                <UniversCard
                  creators={creators}
                  niche="Lifestyle"
                  desc="Quotidien, mode, inspiration."
                />
              }
            >
              <b className="tt-word">Lifestyle</b>
            </Tooltip>
            .
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <RosterCarousel creators={creators} />
        </Reveal>
      </div>
    </section>
  )
}
