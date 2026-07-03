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
