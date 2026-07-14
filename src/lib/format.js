// Helpers texte partagés (roster grid + carousel)

export const titleCase = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/(^|[\s\-'’])([\wà-ÿ])/g, (m, a, b) => a + b.toUpperCase())

// Noms d'affichage personnalisés sur le site vitrine (ex. masquer un nom de famille
// à la demande d'une créatrice). Clé = nom canonique en minuscules. N'affecte QUE le
// site public — l'app et la base gardent le vrai nom.
const NAME_OVERRIDES = { 'lucie botans': 'Lucie Bots' }
export const displayName = (s) => {
  const t = titleCase(s)
  return NAME_OVERRIDES[t.toLowerCase().trim()] || t
}

export const igUser = (handle) => String(handle || '').replace(/^@/, '').trim()

export const initials = (name) =>
  String(name || '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
