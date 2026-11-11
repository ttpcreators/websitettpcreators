import { useEffect, useMemo, useState } from 'react'
import { ROSTER_FALLBACK, asset } from '../data.js'
import { fetchRoster, fetchMediakitSlugs } from './roster.js'
import { titleCase, displayName } from './format.js'

// Photo réduite par Supabase (WebP ~40 Ko au lieu de l'original de 2-3 Mo).
// Les autres adresses (photos locales de repli) restent telles quelles.
export function thumb(url, width = 640) {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=${width}&quality=72`
}

// Créateurs du roster en direct (vue Supabase public_roster) + adresse de leur
// media kit. Tant que le réseau n'a pas répondu (ou s'il échoue), la liste de
// repli de data.js est affichée.
export function useCreators() {
  const [rows, setRows] = useState(null)
  const [slugs, setSlugs] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetchRoster(ctrl.signal)
      .then(setRows)
      .catch(() => {})
    fetchMediakitSlugs(ctrl.signal)
      .then(setSlugs)
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  return useMemo(() => {
    if (!rows)
      return ROSTER_FALLBACK.map((c) => ({
        ...c,
        name: displayName(c.name),
        photo: asset(c.photo),
        slug: null,
      }))
    return rows.map((r) => {
      const canonical = titleCase(r.name)
      const local = ROSTER_FALLBACK.find((f) => f.name.toLowerCase() === canonical.toLowerCase())
      return {
        name: displayName(r.name),
        handle: r.handle || local?.handle || '',
        niche: r.niche || local?.niche || '',
        platform: r.platform || '',
        photo: thumb(r.photo_url, 560) || (local ? asset(local.photo) : null),
        photoFull: r.photo_url || null,
        slug: slugs?.[String(r.name || '').toLowerCase().trim()] || null,
      }
    })
  }, [rows, slugs])
}
