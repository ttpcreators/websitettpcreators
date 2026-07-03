-- ═══════════════════════════════════════════════════════════════
-- Vue publique `public_roster` — À JOUER DANS LE SQL EDITOR du
-- projet Supabase zizvggziggswhrbuyhuo (elle n'a pas été recréée
-- lors de la migration : le site vitrine en a besoin).
--
-- Expose UNIQUEMENT les champs publics des créatrices actives.
-- La clé anon du site lit cette vue ; RLS de `creators` intacte.
-- ═══════════════════════════════════════════════════════════════

create or replace view public.public_roster as
select
  sort_order,
  name,
  handle,
  niche,
  platform,
  photo_url
from public.creators
where coalesce(status, 'actif') ilike 'actif%';

-- Lecture anonyme (le site vitrine) et authentifiée
grant select on public.public_roster to anon, authenticated;

-- Vérification rapide (doit renvoyer les créatrices actives) :
-- select * from public.public_roster order by sort_order;
