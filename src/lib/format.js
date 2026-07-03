// Helpers texte partagés (roster grid + carousel)

export const titleCase = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/(^|[\s\-'’])([\wà-ÿ])/g, (m, a, b) => a + b.toUpperCase())

export const igUser = (handle) => String(handle || '').replace(/^@/, '').trim()

export const initials = (name) =>
  String(name || '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
