-- Vue anonyme `public_mediakit` — data source des media kits du site.
-- Le moteur `mediakit/_assets/mediakit.js` et `mediakit/_build_mediakits.py` lisent cette
-- vue (clé anon) par NOM pour générer chaque page /mediakit/<slug>/.
--
-- ⚠️ Schéma canonique = repo de l'app `ttp-suite-react` (supabase/SETUP.sql +
--    supabase/sql/14-media-kit.sql). Copie ici pour que le repo vitrine soit
--    auto-suffisant. Projet Supabase : zizvggziggswhrbuyhuo.
--
-- N'expose QUE des champs publics (jamais email/tel/SIREN/CA/chiffres bruts) et masque
-- les créatrices inactives.

create or replace view public.public_mediakit
with (security_invoker = false) as
  select
    name,
    handle,
    niche,
    platform,
    photo_url,
    sort_order,
    mediakit
  from public.creators
  where coalesce(status, 'actif') <> 'inactif';

grant select on public.public_mediakit to anon, authenticated;
