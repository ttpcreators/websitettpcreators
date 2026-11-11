import { useEffect, useMemo, useState } from 'react'
import { ROSTER_FALLBACK, asset } from '../data.js'
import { fetchRoster, fetchMediakitSlugs } from './roster.js'
import { titleCase, displayName } from './format.js'

// Photo réduite par Supabase (WebP ~40 Ko au lieu de l'original de 2-3 Mo).
// ⚠️ `resize=contain` obligatoire : sans lui, Supabase écrase la largeur et garde la
// hauteur d'origine (photos étirées).
// Les autres adresses (photos locales de repli) restent telles quelles.
export function thumb(url, width = 640) {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=${width}&resize=contain&quality=72`
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
      .catch(() => setSlugs({})) // échec : on garde les photos de l'app, sans lien
    return () => ctrl.abort()
  }, [])

  return useMemo(() => {
    // on attend aussi les media kits, pour ne pas changer de photo en cours de route
    if (!rows || !slugs)
      return ROSTER_FALLBACK.map((c) => ({
        ...c,
        name: displayName(c.name),
        photo: asset(c.photo),
        slug: null,
      }))
    return rows.map((r) => {
      const canonical = titleCase(r.name)
      const local = ROSTER_FALLBACK.find((f) => f.name.toLowerCase() === canonical.toLowerCase())
      const mk = slugs?.[String(r.name || '').toLowerCase().trim()]
      // photo de l'app (= photo de couverture du media kit). Les photos « Instagram »
      // des media kits sont des captures de profil : pas utilisables comme portrait.
      const src = r.photo_url
      return {
        name: displayName(r.name),
        handle: r.handle || local?.handle || '',
        niche: r.niche || local?.niche || '',
        platform: r.platform || '',
        photo: thumb(src, 560) || (local ? asset(local.photo) : null),
        photoFull: src || null,
        slug: mk?.slug || null,
      }
    })
  }, [rows, slugs])
}
