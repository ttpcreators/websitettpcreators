// Roster live : lit la vue publique `public_roster` du projet Supabase
// (champs publics uniquement, RLS-safe). Quand l'agence ajoute une créatrice
// dans TTP Suite, elle apparaît ici automatiquement.
// La clé anon est publique par design (sécurité via RLS / vue dédiée).
// ⚠️ La vue doit exister : voir supabase/public_roster.sql

const SB_URL = 'https://zizvggziggswhrbuyhuo.supabase.co'
const SB_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3ppZ2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30.5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU'

export async function fetchRoster(signal) {
  const res = await fetch(
    `${SB_URL}/rest/v1/public_roster?select=name,handle,niche,platform,photo_url&order=sort_order`,
    {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      signal,
    },
  )
  if (!res.ok) throw new Error(`public_roster HTTP ${res.status}`)
  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('public_roster vide')
  return rows
}

// Adresse du media kit de chaque créateur (/mediakit/<slug>/), calculée comme
// _build_mediakits.py : slug choisi dans l'app, sinon le prénom ; doublon → -2, -3…
const slugify = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'createur'

export async function fetchMediakitSlugs(signal) {
  const res = await fetch(
    `${SB_URL}/rest/v1/public_mediakit?select=name,slug:mediakit->>slug&order=sort_order`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, signal },
  )
  if (!res.ok) throw new Error(`public_mediakit HTTP ${res.status}`)
  const used = new Set()
  const map = {}
  for (const r of await res.json()) {
    const base = slugify(r.slug || String(r.name || '').split(/\s+/)[0])
    let slug = base
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`
    used.add(slug)
    map[String(r.name || '').toLowerCase().trim()] = { slug }
  }
  return map
}
