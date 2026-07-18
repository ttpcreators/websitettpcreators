# TTP Creators — Site vitrine

Site officiel de l'agence **TTP Creators** — talent management Sport & Lifestyle, Lyon · Genève.

🌐 **Production : https://ttpcreators.pro**

React 19 + Vite + [motion](https://motion.dev) (Framer Motion), CSS pur, police Inter.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
```

## Déploiement

Automatique : chaque push sur la branche de production (voir les *deployment branch policies*
de l'environnement `github-pages`) déclenche `.github/workflows/deploy.yml` → build → mise en
ligne sur https://ttpcreators.pro (~1 minute). Le domaine est géré chez OVH (A records GitHub
Pages + CNAME www) avec HTTPS forcé.

> ⚠️ La branche `claude/agency-website-m3e282` est l'**archive de l'ancien site** — conservée
> en lecture, exclue du déploiement. Ne pas la supprimer ni la réautoriser à déployer.

## Mettre à jour le contenu

| Quoi | Où |
|---|---|
| Textes, nav, stats, roster de repli | `src/data.js` |
| Textes du hero (titre, eyebrow, lead) | `src/components/Hero.jsx` |
| Photos fondateurs | `public/assets/about/equipe.jpg` (Marc) / `gianni.jpg` |
| Photos créatrices | `public/assets/creators/*.jpg` (noms en minuscules !) |
| Favicon | `public/assets/favicon.png` (carré, 512×512) |
| Email de contact | `CONTACT_EMAIL` dans `src/data.js` |

## Roster live (Supabase)

La section « Nos créatrices » lit la vue `public_roster` du projet Supabase de TTP Suite
(**active en production** : ajouter une créatrice dans l'app la fait apparaître sur le site) ;
si la vue est injoignable, une liste statique de repli s'affiche. Définition de la vue :
[`supabase/public_roster.sql`](supabase/public_roster.sql).

## Pour les mainteneurs (humains et IA)

Lire **[CLAUDE.md](CLAUDE.md)** : conventions du projet, règles de direction artistique
décidées par les fondateurs, pièges connus (casse des fichiers, cache CDN, Dependabot,
environnement Pages) et emplacements des sauvegardes.

## Sauvegardes

- Tag `v1.0` + branche `backup/v1-2026-07-05` — état stable complet
- L'historique git conserve toutes les versions antérieures
