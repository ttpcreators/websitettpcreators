# TTP Creators — Site vitrine

Site officiel de l'agence de talent management **TTP Creators** (Sport & Lifestyle, Lyon · Genève).
**En production sur https://ttpcreators.pro** — toute modification poussée sur la branche de
déploiement met à jour le site public en ~1 minute. Agir en conséquence.

## Stack

React 19 + Vite, **CSS pur** (pas de Tailwind, pas de TypeScript — ne pas en introduire),
`motion` (= framer-motion, importer depuis `motion/react`), `lucide-react`, `d3-geo`/`d3-timer`
(globe uniquement). Police Inter via Google Fonts (`index.html`).

## Commandes

```bash
npm install        # première fois
npm run dev        # http://localhost:5173
npm run build      # tsc absent : vite build seul, dist/
```

## Structure

- `src/App.jsx` — assemble les sections dans l'ordre : Hero, Clients, Manifesto, About,
  Services, Method, Network (globe), Stats, Roster, Story, Contact + Navbar/MenuOverlay/Footer
- `src/data.js` — TOUTES les données éditoriales (textes, nav, roster de repli, clients, stats).
  `CONTACT_EMAIL = partnerships@ttpcreators.pro` (source unique).
- `src/App.css` — tout le style (classes par section). `src/index.css` — reset + tokens.
- `src/components/` — un fichier par section + composants portés (voir ci-dessous)
- `public/assets/` — images. `about/equipe.jpg` = Marc, `about/gianni.jpg` = Gianni,
  `creators/*.jpg` = les 8 créatrices, `clients/*.png` = logos marques (blancs, colorés via
  mask CSS), `favicon.png` (unique, 512×512), `geo/ne_110m_land.json` (globe, servi en local)
- `supabase/public_roster.sql` — vue à créer côté Supabase (voir Roster)

## Règles direction artistique (décisions utilisateur, NE PAS revenir dessus)

- DA **strictement sobre** : blanc, encre `--ink #0b0b0d`, bordeaux profond `--accent #3d0000`
  en touches discrètes. Une passe couleur complète a été appliquée puis **rejetée par les
  fondateurs** (historique git : commits `e3f4784`→`4a7126c`). **Ne pas recolorer** sans
  instruction explicite, et **montrer une capture avant de déployer** tout changement visuel.
- Titre hero : « Trust The Process. » — le deuxième T MAJUSCULE (initiales = TTP), une seule
  ligne, effet machine à écrire.
- Navbar : logo seul (pas de texte « TTP Creators »).
- Loaders/effets décoratifs refusés dans la section Méthode ; le AiLoader ne sert QUE dans le
  formulaire de contact pendant l'envoi.

## Composants portés depuis shadcn/Tailwind (convention)

L'utilisateur colle régulièrement des composants shadcn/aceternity/ruixen (TSX + Tailwind).
**Toujours les porter vers JSX + CSS pur** (classes préfixées dans App.css), jamais convertir
le projet. `motion` == framer-motion (ne pas installer framer-motion). Pour récupérer un
composant aceternity : `curl https://ui.aceternity.com/registry/<nom>.json` (ne PAS lancer
`npx shadcn add` — refuser l'init components.json).
Déjà portés : AnimatedHighlightText (manifesto), TooltipCard (mots soulignés pointillés),
RosterCarousel (AnimatedTestimonials), BorderBeam (boutons), PlatformStage (cards-demo-3),
DottedGlobe (wireframe-dotted-globe), AiLoader.

## Déploiement (GitHub Pages + Actions)

- Repo : `ttpcreators/websitettpcreators`. **PRODUCTION = branche `main` UNIQUEMENT.**
  L'environnement `github-pages` n'autorise plus QUE `main` (les policies `claude/react-site`
  et `claude/agency-website-m3e282` ont été supprimées le 2026-07-13). Un seul point de vérité.
- Workflow `.github/workflows/deploy.yml` (sur main) : `npm ci && npm run build` (React → `dist/`)
  PUIS génération du **media kit** (`python3 mediakit/_build_mediakits.py`, données live Supabase)
  → `cp -r mediakit dist/mediakit` → rendu **PDF paysage** (`SERVE_DIR=dist python3
  mediakit/_render_pdfs.py`, Chrome headless) → garde-fou (build React valide, pas de `<video>`)
  → upload `dist/`. Le site + les media kits partent ENSEMBLE. Cron horaire `:17` → toute
  nouvelle créatrice ajoutée dans l'app obtient sa page `/mediakit/<slug>/` + son PDF toute seule.
  Échec « Deployment failed, try again later » = transitoire GitHub → `gh run rerun <id> --failed`.
- ⚠️ La branche `claude/agency-website-m3e282` = ARCHIVE de l'ancien site (vanilla JS + media kit
  vanilla). En juil. elle avait été ré-autorisée puis avait redéployé l'ancien site par-dessus le
  vrai site React (régression corrigée le 2026-07-13). Elle est désormais **retirée des branches
  autorisées ET son workflow est neutralisé** (`on: workflow_dispatch` seul). NE PAS la
  réautoriser, NE PAS la supprimer, NE PAS déployer depuis elle.
- ⚠️ NE PAS désactiver le workflow via l'API Actions : l'entité (par chemin de fichier) est
  partagée entre branches — ça tuerait aussi les déploiements de production.
- **Media kit** : tout vit dans `mediakit/` (moteur `mediakit.js` générique, `_build_mediakits.py`
  = 1 shell/créatrice depuis la vue anon `public_mediakit`, `_render_pdfs.py` = PDF 16:9). Les PDF
  sont gitignorés (régénérés en CI). Détails : la doc media kit côté app + la vue `public_mediakit`.
- GitHub Pages est **sensible à la casse** des noms de fichiers (et macOS non) : renommage de
  casse ⇒ `git mv -f` obligatoire. Les uploads web des fondateurs arrivent avec des noms
  arbitraires (`IMG_1234.jpg`, majuscules) → renommer/compresser (`sips`) puis commit.
- Cache CDN : `cache-control: max-age=600`. Après déploiement, vérifier avec `?v=$RANDOM` et
  rappeler Cmd+Shift+R à l'utilisateur.

## Domaine (OVH) et emails

`ttpcreators.pro` chez OVH : 4 A `@` → 185.199.108-111.153, CNAME `www` → `ttpcreators.github.io.`,
Pages `cname=ttpcreators.pro`, `https_enforced=true`. ⚠️ Les **MX Google restent intacts**
(emails partnerships@…) — ne jamais toucher aux MX/SPF/DMARC. Le champ sous-domaine OVH exige
`@` pour la racine.

## Roster (Supabase)

La section Roster lit `public_roster` sur le projet Supabase `zizvggziggswhrbuyhuo`
(clé anon dans `src/lib/roster.js`, publique par design). **La vue EXISTE et est active**
(vérifié 2026-07-18) : la synchro live avec l'app TTP Suite fonctionne — une créatrice ajoutée
dans l'app apparaît sur le site. `ROSTER_FALLBACK` (data.js) reste le repli si la vue est
injoignable ; définition dans `supabase/public_roster.sql`. Contrainte : tout doit rester
**0 €** (free tiers, repo public).

## Formulaire de contact

Sans backend : `FORM_ENDPOINT = ''` dans `src/components/Contact.jsx` → repli mailto pré-rempli.
Pour un envoi direct : créer un form sur formspree.io et renseigner l'URL.

## Sauvegardes

- Tags git : `v1.0` (état stable validé 2026-07-05) et `handoff-2026-07-18` (passation) ;
  branche `backup/v1-2026-07-05`. L'historique git conserve tout le reste.
- Zip local (machine de Marc) : `~/Downloads/ttp-creators-site-backup-2026-07-05.zip`
- Ancien site : branche `claude/agency-website-m3e282` (sa branche `backup-fond-blanc-v1` est
  une variante de l'ANCIEN site, sans intérêt pour le site actuel) ; copie locale dans
  `~/Claude/TTP SOCIETY/_ARCHIVE-anciennes-versions/`
