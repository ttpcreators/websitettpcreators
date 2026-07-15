#!/usr/bin/env python3
"""
Génère une page media kit par créatrice : mediakit/<slug>/index.html.

Chaque page est un shell léger qui référence les assets partagés
(_assets/mediakit.css + mediakit.js + anton.woff2) et bake window.MK
(nom, handle, plateforme, photo) pour un rendu immédiat ; le moteur lit
ensuite public_mediakit (anon) par NOM pour le contenu à jour.

Slug = mediakit.slug (champ « Lien » de l'app) sinon le prénom, minuscule,
sans accent ; doublons dédoublonnés (-2, -3…).

Usage : python3 mediakit/_build_mediakits.py   (depuis la racine du repo)
"""
import json
import os
import re
import unicodedata
import urllib.request

SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co"
SB_KEY = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3pp"
          "Z2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30."
          "5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU")

ROOT = os.path.dirname(os.path.abspath(__file__))         # …/mediakit
OG_FALLBACK = "https://ttpcreators.pro/og-image.png"
# Version du build → nom de PDF versionné (media-kit-<build>.pdf). URL unique à chaque
# déploiement ⇒ aucun edge CDN / proxy ne peut servir un PDF périmé (le query string, lui,
# est ignoré par Fastly). En CI = SHA du commit ; en local = "dev". DOIT correspondre à
# la même valeur dans _render_pdfs.py (tous deux lisent GITHUB_SHA dans le même job CI).
BUILD = (os.environ.get("GITHUB_SHA") or "dev")[:12]


def slugify(s):
    s = unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "createur"


def esc(s):
    return (str(s or "")).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


# Noms d'AFFICHAGE personnalisés (une créatrice peut masquer son nom de famille) : n'affecte
# que le titre / nom de fichier / méta du media kit. Le nom RÉEL reste baké dans window.MK et
# sert de clé (fetch public_mediakit, slug). Idem côté JS (mediakit.js NAME_OVERRIDES).
NAME_OVERRIDES = {"lucie botans": "LUCIE BOTS"}


def display_name(n):
    return NAME_OVERRIDES.get(str(n or "").strip().lower(), n)


def fetch_creators():
    url = SB_URL + "/rest/v1/public_mediakit?select=name,handle,niche,platform,photo_url,mediakit,sort_order&order=sort_order"
    req = urllib.request.Request(url, headers={"apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def shell(c, slug):
    name = c.get("name") or ""      # nom RÉEL (clé : baked window.MK, slug, fetch)
    disp = display_name(name)       # nom AFFICHÉ (titre / nom de fichier / méta)
    mk = c.get("mediakit") or {}
    handle = str(mk.get("handle") or c.get("handle") or "").lstrip("@")
    platform = c.get("platform") or "instagram"
    photo = c.get("photo_url") or None
    niche = c.get("niche") or ""
    # On bake la donnée COMPLÈTE (y compris le blob `mediakit` : audience, plateformes,
    # formats, marques, photos) → le rendu PDF en CI est DÉTERMINISTE et n'attend plus un
    # fetch Supabase live (qui pouvait échouer → PDF tronqué à 2 pages, ex. Léna). Le fetch
    # live reste ensuite comme rafraîchissement pour la page web.
    baked = json.dumps({"name": name, "handle": handle, "platform": platform, "photo_url": photo, "mediakit": mk}, ensure_ascii=False)
    canonical = "https://ttpcreators.pro/mediakit/%s/" % slug
    desc = "Media kit de %s%s — audience, statistiques et collaborations. TTP Creators." % (
        disp.title() if disp.isupper() else disp, (" · " + niche) if niche else "")
    og_img = photo or OG_FALLBACK
    return """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Media Kit — {title} · TTP Creators</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="profile">
<meta property="og:title" content="Media Kit — {title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og_img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="../../assets/favicon-32.png?v=2">
<link rel="apple-touch-icon" href="../../assets/favicon-180.png?v=2">
<link rel="stylesheet" href="../_assets/mediakit.css">
</head>
<body>
<div class="kit" id="kit"></div>
<a class="pdf-btn" id="dl-pdf" href="media-kit-{build}.pdf" download="Media Kit - {title}.pdf" aria-label="Télécharger le media kit en PDF">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
  Télécharger en PDF
</a>
<div class="progress" id="progress" aria-hidden="true"></div>
<script>window.MK = {baked};</script>
<script src="../_assets/mediakit.js"></script>
</body>
</html>
""".format(title=esc(disp.title() if disp.isupper() else disp), desc=esc(desc),
           canonical=canonical, og_img=esc(og_img), baked=baked, build=BUILD)


def main():
    creators = fetch_creators()
    used, out = set(), []
    for c in creators:
        mk = c.get("mediakit") or {}
        base = mk.get("slug") or slugify((c.get("name") or "").split()[0] if c.get("name") else "")
        base = slugify(base)
        slug, i = base, 2
        while slug in used:
            slug = "%s-%d" % (base, i)
            i += 1
        used.add(slug)
        d = os.path.join(ROOT, slug)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
            f.write(shell(c, slug))
        out.append((c.get("name"), slug))
    print("Pages générées : %d" % len(out))
    for name, slug in out:
        print("  /mediakit/%-20s ← %s" % (slug + "/", name))


if __name__ == "__main__":
    main()
