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
- `public/assets/` — images. `about/marc.jpg` = Marc, `about/gianni.jpg` = Gianni,
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
- Vocabulaire : dire **« créateurs »** (masculin générique), jamais « créatrices », dans tous
  les textes visibles du site (décision Marc 2026-09-29 — garder une image ouverte du roster).
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
- **Media kits CRÉATEURS** : direction **« Éditorial »** choisie par Marc le 2026-10-05 (parmi 3
  directions maquettées) : page blanche, encre noire, grand serif **Instrument Serif** + **Instrument
  Sans** (woff2 auto-hébergés dans `_assets/`), photo posée comme un tirage, chiffres composés comme
  dans un article, marques en « crédits », tarifs à points de conduite, aucune case vide ni « — »
  (donnée absente = ligne masquée). Moteur `_assets/kit-editorial.js` + `kit-editorial.css` :
  une section = une page 16:9 en unités `cqw` (même rendu web ordinateur et PDF), colonne sur
  téléphone (`@media screen` uniquement, sinon le PDF prendrait la mise en page téléphone).
  Pages : couverture, plateformes (2 par page), audience, « En capture » (captures de profils +
  stats), marques et tarifs, contact. Thèmes créateurs : sans attribut = blanc ; `bordeaux`/
  `sauge` = encre d'accent (nom en italique, grands chiffres) ; `ivoire` = papier ; `minuit` =
  page noire (`kit_theme_attr` dans `_build_mediakits.py`, sélecteur `kind="creator"` dans l'app).
  Textes visibles neutres (« Qui suit Prénom », « Ces marques lui ont fait confiance »).
- **Deck AGENCE** (`/mediakit/agence/`) : même direction « Éditorial » depuis 2026-10-05.
  Moteur `_assets/agence-editorial.js` + `agence-editorial.css`, chargé APRÈS `kit-editorial.css`
  (polices, thèmes, page 16:9, pages marques et contact réutilisées). Pages : couverture (mosaïque
  des portraits du roster), l'agence (titre, accroche, piliers, chiffres), partenaires (marques
  en « générique », liste `CLIENTS` du build), 1 page par créateur (lien « Voir son media kit
  complet » vers son slug, baké par le build), casting « Qui fait quoi », concepts, contact
  (photo d'agence). Contenu éditable dans l'app (blob `agency_mediakit`) ; les anciens textes
  par défaut « créatrices » enregistrés en base sont remplacés à l'affichage (table `LEGACY`,
  idem dans l'app) tant qu'ils n'ont pas été modifiés. Thèmes = ceux des kits créateurs.
- **Aperçus de partage des media kits** (2026-10-07) : chaque kit créateur et le deck agence ont
  leur carte 1200×630 (og:image) dans le style Éditorial : page en mode `?og=1` (`buildOg` dans
  `kit-editorial.js` / `agence-editorial.js`, styles `.og-card`), capturée en JPEG par
  `_render_pdfs.py` (`render_og`) → `mediakit/<slug>/apercu-<build>.jpg` (nom versionné comme le
  PDF, gitignoré). Balises og/twitter complètes via `og_tags()` de `_build_mediakits.py` ; le kit
  UGC reprend la carte de son kit principal. Capture ratée → copie de `og-ttp.jpg` (image de
  l'accueil). Les anciens shells (créateurs retirés de l'app) n'ont pas de carte.
- **Kits UGC** : gardent `mediakit.css` (DA **« Minuit »** alignée sur l'app TTP
  Suite depuis 2026-09-29 : fond #000, surface #0a0a0a, filets #222, texte #fafafa, Inter — les
  tokens historiques `--deep/--wine/--rose/--ink…` y sont REMAPPÉS vers cette palette, ne pas les
  réinterpréter comme du bordeaux). Tout vit dans `mediakit/` (`mediakit.js` et
  `mediakit-agence.js/.css` = anciens moteurs, plus utilisés ; `_build_mediakits.py`
  = 1 shell/créateur depuis la vue anon `public_mediakit`, `_render_pdfs.py` = PDF 16:9). Les PDF
  sont gitignorés (régénérés en CI). Détails : la doc media kit côté app + la vue `public_mediakit`.
- **Thèmes des kits UGC** : `minuit` (défaut) · `ivoire` · `blanc` · `bordeaux` · `sauge`
  (`mediakit.theme`, même valeur que le kit créateur). Palettes = blocs
  `:root[data-mk-theme="…"]` de `mediakit.css` (tokens uniquement, + `--canvas`,
  `--d1…--d6` pour l'anneau). L'attribut est baké sur `<html>` par `_build_mediakits.py` (PDF CI) puis
  ré-appliqué par les JS ; `?theme=<nom>` = aperçu. Toute couleur ajoutée doit passer par un token.
- **Version anglaise des media kits** (depuis 2026-10-07) : chaque kit existe aussi en anglais à
  `/mediakit/<slug>/en/` (deck agence : `/mediakit/agence/en/`), généré par `_build_mediakits.py`
  (`<html lang="en">`, hreflang, sélecteur FR / EN en bas à gauche, PDF + carte d'aperçu propres).
  `_assets/mk-i18n.js` (chargé avant les moteurs) donne la langue et traduit les valeurs saisies en
  français (formats, pays, villes, étiquettes, tarifs, précisions du casting). Textes libres anglais
  saisis dans l'app : `bioEn`, `ratesNoteEn` (créateur) ; `introEn`, `pillarsEn` (même position que
  `pillars`), `kpis.*LabelEn`, `concepts[].titleEn/textEn/highlightsEn` (agence). Jamais de français
  sur une page anglaise : un texte libre sans traduction est omis (bio) ou remplacé par le défaut anglais.
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
