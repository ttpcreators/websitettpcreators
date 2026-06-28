# TTP Creators — Site officiel

Site vitrine de l'agence de créateurs **TTP Creators**. Statique, sans build, déployable partout.

## Stack

- HTML5 sémantique
- CSS moderne (custom properties, grid, clamp, container-friendly)
- JavaScript vanilla (zéro dépendance)
- Police : Inter (display + texte), via Google Fonts
- Palette : blanc + burgundy foncé (accent `--accent: #5a0f22`)

## Structure

```
index.html    Page unique (hero, services, réalisations, créateurs, stats, contact, footer)
styles.css    Design system + sections + responsive
main.js       Nav sticky, menu mobile, scroll reveal, compteurs, validation formulaire
```

## Lancer en local

Aucune installation. Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Déploiement

### GitHub Pages
1. Repo > Settings > Pages
2. Source : branche du site, dossier `/ (root)`
3. Le site est en ligne en quelques minutes

### Netlify / Vercel
Glisser-déposer le dossier, ou connecter le repo. Aucun build command, dossier de publication = racine.

## Principes de design (skill "taste")

Le design suit le framework anti-slop **taste-skill** :

- **Thème verrouillé** : dark sur toute la page, aucune inversion en cours de scroll
- **Une seule couleur d'accent** (`--accent`), constante partout
- **Un seul système de corner-radius** (`--r-*`)
- **Contraste WCAG AA** sur le texte et les champs de formulaire
- **Vraies images** (pas de blocs factices)
- **Layouts asymétriques** (bento services, grille réalisations) plutôt que 3 cartes égales
- **Zéro tiret cadratin** dans le contenu
- Respect de `prefers-reduced-motion`

## Personnalisation rapide

| Élément | Où |
|---|---|
| Couleur d'accent | `--accent` dans `styles.css` (`:root`) |
| Polices | balise `<link>` Google Fonts + `--f-display` / `--f-body` |
| Textes & sections | `index.html` |
| Images | attributs `src` des `<img>` (actuellement Unsplash, à remplacer par tes visuels) |
| Email / téléphone | section `#contact` et footer dans `index.html` |

## À faire avant la mise en production

- [ ] Remplacer les images Unsplash par les visuels réels de l'agence
- [ ] Remplacer les logos placeholder du bandeau « Ils nous font confiance » (section `.logos` dans `index.html`) par les vrais logos clients : remplacer chaque `<svg class="logo-mark">` + `<span>` par un `<img src="logos/marque.svg" alt="Marque" class="logo-mark">`. Penser à mettre à jour les deux jeux (le second est la copie pour la boucle)
- [ ] Mettre les vrais noms et stats du roster
- [ ] Activer le formulaire : créer un formulaire sur [formspree.io](https://formspree.io), puis remplacer `votre-id` dans l'attribut `action` du `<form id="contactForm">` (`index.html`) par ton identifiant. Tant que ce n'est pas fait, le formulaire ouvre automatiquement le client mail (repli `mailto`). Penser à mettre la vraie adresse dans `CONTACT_EMAIL` (`main.js`)
- [ ] Remplacer l'email `hello@ttpcreators.com` et le téléphone dans `index.html` (section contact, footer, JSON-LD)
- [ ] Renseigner les liens réseaux sociaux dans le footer
- [ ] Ajouter un favicon et une image Open Graph
