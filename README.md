# TTP Creators — Site vitrine

Site vitrine de l'agence **TTP Creators** (talent management Sport & Lifestyle, Lyon · Genève).
React + Vite + [motion](https://motion.dev) (Framer Motion), CSS pur, police Inter.

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
```

## Roster live (Supabase)

La section « Nos créatrices » lit la vue `public_roster` du projet Supabase
(`zizvggziggswhrbuyhuo`). Si la requête échoue, une liste statique de repli
s'affiche (photos locales dans `public/assets/creators/`).

⚠️ **Action requise une fois** : la vue `public_roster` n'existe pas encore sur
le nouveau projet Supabase. Coller le contenu de
[`supabase/public_roster.sql`](supabase/public_roster.sql) dans le **SQL Editor**
du dashboard Supabase et l'exécuter. Ensuite, chaque créatrice ajoutée dans
TTP Suite apparaît automatiquement sur le site.

## Formulaire de contact

Par défaut, le bouton « Envoyer » ouvre le client mail
(`partnerships@ttpcreators.pro`) avec le message pré-rempli. Pour un envoi
direct sans client mail : créer un formulaire gratuit sur
[formspree.io](https://formspree.io) et coller son URL dans `FORM_ENDPOINT`
(`src/components/Contact.jsx`).

## Déploiement (GitHub Pages, 0 €)

`vite.config.js` utilise `base: './'` : le dossier `dist/` se déploie tel quel
sur GitHub Pages (workflow Actions ou branche dédiée), comme les autres repos TTP.
