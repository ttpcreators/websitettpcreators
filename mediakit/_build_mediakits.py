#!/usr/bin/env python3
"""
Génère une page media kit par créatrice : mediakit/<slug>/index.html.

Chaque page est un shell léger qui référence les assets partagés
(_assets/kit-editorial.css + kit-editorial.js, direction « Éditorial ») et bake window.MK
(nom, handle, plateforme, photo) pour un rendu immédiat ; le moteur lit
ensuite public_mediakit (anon) par NOM pour le contenu à jour.

Slug = mediakit.slug (champ « Lien » de l'app) sinon le prénom, minuscule,
sans accent ; doublons dédoublonnés (-2, -3…).

Usage : python3 mediakit/_build_mediakits.py   (depuis la racine du repo)
"""
import json
import os
import re
import time
import unicodedata
import urllib.request

SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co"
SB_KEY = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3pp"
          "Z2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30."
          "5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU")

ROOT = os.path.dirname(os.path.abspath(__file__))         # …/mediakit
# Version du build → nom de PDF versionné (media-kit-<build>.pdf). URL unique à chaque
# déploiement ⇒ aucun edge CDN / proxy ne peut servir un PDF périmé (le query string, lui,
# est ignoré par Fastly). En CI = SHA du commit ; en local = "dev". DOIT correspondre à
# la même valeur dans _render_pdfs.py (tous deux lisent GITHUB_SHA dans le même job CI).
BUILD = (os.environ.get("GITHUB_SHA") or "dev")[:12]


MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre"]


MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]


def mois_fr():
    t = time.localtime()
    return "%s %d" % (MOIS[t.tm_mon - 1], t.tm_year)


def month_en():
    t = time.localtime()
    return "%s %d" % (MONTHS[t.tm_mon - 1], t.tm_year)


# ── Version anglaise (marques étrangères) ─────────────────────────────────────
# Chaque media kit (et le deck agence) existe aussi en anglais dans le sous-dossier
# en/ : même moteur, <html lang="en">, son propre PDF et sa propre carte d'aperçu.
# mk-i18n.js lit la langue de la page ; les textes libres anglais (bioEn, introEn…)
# se saisissent dans l'app.
def lang_links(canonical_fr, lang):
    """hreflang (Google) + sélecteur FR / EN affiché en bas à gauche de la page."""
    en = canonical_fr + "en/"
    head = ('<link rel="alternate" hreflang="fr" href="%s">\n'
            '<link rel="alternate" hreflang="en" href="%s">\n'
            '<link rel="alternate" hreflang="x-default" href="%s">') % (canonical_fr, en, canonical_fr)
    if lang == "en":
        nav = ('<nav class="lang-switch" aria-label="Language"><a href="../" hreflang="fr" lang="fr">FR</a>'
               '<a href="./" aria-current="page">EN</a></nav>')
    else:
        nav = ('<nav class="lang-switch" aria-label="Langue"><a href="./" aria-current="page">FR</a>'
               '<a href="en/" hreflang="en" lang="en">EN</a></nav>')
    return head, nav


def de(nom):
    """« de Candice » / « d'Ana » (élision devant une voyelle)."""
    return ("d'" if re.match(r"[AEIOUYÀÂÉÈÊÎÔÛaeiouyàâéèêîôû]", nom or "") else "de ") + (nom or "")


# Aperçu de partage (WhatsApp, iMessage, LinkedIn…) : carte 1200×630 capturée en CI par
# _render_pdfs.py depuis la page en mode ?og=1 → mediakit/<slug>/apercu-<build>.jpg.
# Nom versionné comme le PDF : une URL neuve à chaque déploiement, jamais servie périmée.
def og_tags(title, desc, url, image, alt, kind="profile", lang="fr"):
    return """<meta property="og:site_name" content="TTP Creators">
<meta property="og:locale" content="{locale}">
<meta property="og:locale:alternate" content="{alt_locale}">
<meta property="og:type" content="{kind}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:secure_url" content="{image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{image}">""".format(kind=kind, title=esc(title), desc=esc(desc), url=esc(url), image=esc(image), alt=esc(alt),
                                                       locale="en_US" if lang == "en" else "fr_FR",
                                                       alt_locale="fr_FR" if lang == "en" else "en_US")


def apercu(slug, lang="fr"):
    return "https://ttpcreators.pro/mediakit/%s/%sapercu-%s.jpg" % (slug, "en/" if lang == "en" else "", BUILD)


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


# Marques & piliers de l'agence pour le MEDIA KIT AGENCE (deck global). Copie des
# sources canoniques du site (src/data.js CLIENTS + PILLARS) pour rester auto-suffisant ;
# garder synchro si data.js change. Logos = silhouettes masquées en bordeaux (dist/assets/clients/).
CLIENTS = [
    {"name": "Tesla", "file": "tesla.png"},
    {"name": "Ray-Ban", "file": "ray-ban.png"},
    {"name": "HP", "file": "hp.png"},
    {"name": "Speedo", "file": "speedo.png"},
    {"name": "Palladium", "file": "palladium.png"},
    {"name": "Bumble", "file": "bumble.png"},
    {"name": "Magnum", "file": "magnum.png"},
    {"name": "Qonto", "file": "quonto.png"},
    {"name": "Nutripure", "file": "nutripure.png"},
    {"name": "So Shape", "file": "so-shape.png"},
    {"name": "Novoma", "file": "novoma.png"},
]
PILLARS = [
    {"title": "Talent d'abord", "text": "Un créateur n'est pas une audience : c'est une marque. On construit une identité qui dure, pas des pics de vues."},
    {"title": "Studio intégré", "text": "Stratégie, production, négociation : tout se passe en interne. Une seule équipe, aucune perte en ligne."},
    {"title": "Résultats mesurés", "text": "Pas de feeling : des KPIs clairs et un reporting précis, à chaque collaboration."},
]


def fetch_creators():
    url = SB_URL + "/rest/v1/public_mediakit?select=name,handle,niche,platform,photo_url,mediakit,sort_order&order=sort_order"
    req = urllib.request.Request(url, headers={"apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def fetch_agency():
    """Contenu agence éditable (intro/piliers/KPIs/contact), saisi dans l'app et
    exposé par la vue anon public_agency_mediakit. TOLÉRANT : si la vue n'existe pas
    encore (SQL pas appliqué) ou en cas d'erreur réseau → {} et le deck retombe sur
    ses valeurs par défaut (côté JS AG_DEFAULTS). Ne JAMAIS faire échouer le build."""
    url = SB_URL + "/rest/v1/public_agency_mediakit?select=data&limit=1"
    req = urllib.request.Request(url, headers={"apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            rows = json.load(r)
        return (rows[0].get("data") if rows else None) or {}
    except Exception as e:
        print("  (media kit agence : contenu agence non chargé — défauts utilisés : %s)" % e)
        return {}


# Thèmes de couleurs du media kit (choisis dans l'app : mediakit.theme / agence.theme).
# « minuit » = défaut, sans attribut. Baké sur <html> → appliqué AVANT le 1er rendu
# (pas de flash, et le PDF rendu en CI sort dans le bon thème).
MK_THEMES = ("ivoire", "blanc", "bordeaux", "sauge")


def theme_attr(t):
    return ' data-mk-theme="%s"' % t if t in MK_THEMES else ""


# Pages créateurs : direction « Éditorial » (kit-editorial.css/js, 2026-10-05). Page blanche
# par défaut (« blanc » = sans attribut) ; les autres thèmes changent l'encre ou le papier.
KIT_THEMES = ("bordeaux", "sauge", "ivoire", "minuit")


def kit_theme_attr(t):
    return ' data-mk-theme="%s"' % t if t in KIT_THEMES else ""


def shell(c, slug, lang="fr"):
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
    base = "https://ttpcreators.pro/mediakit/%s/" % slug
    en = lang == "en"
    canonical = base + ("en/" if en else "")
    title = disp.title() if disp.isupper() else disp
    if en:
        desc = "Audience, key figures and partner brands of %s%s. TTP Creators media kit, %s." % (
            title, (" (" + niche + ")") if niche else "", month_en())
        og = og_tags(title + " · Media kit", desc, canonical, apercu(slug, "en"), title + "'s media kit cover", lang="en")
    else:
        desc = "Audience, chiffres et marques partenaires %s%s. Media kit TTP Creators, %s." % (
            de(title), (" (" + niche + ")") if niche else "", mois_fr())
        og = og_tags(title + " · Media kit", desc, canonical, apercu(slug), "Couverture du media kit " + de(title))
    hreflang, nav = lang_links(base, lang)
    up = "../" if en else ""   # la page anglaise est un dossier plus bas
    return """<!doctype html>
<html lang="{lang}"{theme}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · {title_suffix}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
{hreflang}
{og}
<link rel="icon" type="image/png" sizes="32x32" href="{up}../../assets/favicon-32.png?v=2">
<link rel="apple-touch-icon" href="{up}../../assets/favicon-180.png?v=2">
<link rel="stylesheet" href="{up}../_assets/kit-editorial.css">
</head>
<body>
<div class="kit" id="kit"></div>
<a class="pdf-btn" id="dl-pdf" href="media-kit-{build}.pdf" download="Media Kit - {title}{file_suffix}.pdf" aria-label="{pdf_aria}">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
  {pdf_label}
</a>
{nav}
<div class="progress" id="progress" aria-hidden="true"></div>
<script>window.MK = {baked};</script>
<script src="{up}../_assets/mk-i18n.js"></script>
<script src="{up}../_assets/kit-editorial.js"></script>
</body>
</html>
""".format(lang="en" if en else "fr", theme=kit_theme_attr(mk.get("theme")), title=esc(title), desc=esc(desc),
           title_suffix="TTP Creators media kit" if en else "Media kit TTP Creators",
           canonical=canonical, hreflang=hreflang, og=og, baked=baked, build=BUILD, up=up, nav=nav,
           file_suffix=" (EN)" if en else "",
           pdf_aria="Download the media kit as a PDF" if en else "Télécharger le media kit en PDF",
           pdf_label="Download PDF" if en else "Télécharger en PDF")


def ugc_shell(c, slug):
    """Page media kit UGC (mediakit/<slug>/ugc/index.html) — orientée personne.
    Générée UNIQUEMENT si le créateur a activé son kit UGC (mediakit.ugc.enabled).
    Chemins d'assets en `../../` car la page est un niveau plus bas que le kit standard."""
    name = c.get("name") or ""
    disp = display_name(name)
    title = disp.title() if disp.isupper() else disp
    mk = c.get("mediakit") or {}
    handle = str((mk.get("ugc") or {}).get("handle") or mk.get("handle") or c.get("handle") or "").lstrip("@")
    photo = (mk.get("photos") or {}).get("hero") or c.get("photo_url") or None
    baked = json.dumps({"name": name, "handle": handle, "platform": c.get("platform") or "instagram",
                        "photo_url": photo, "mediakit": mk}, ensure_ascii=False)
    canonical = "https://ttpcreators.pro/mediakit/%s/ugc/" % slug
    desc = "Media kit UGC %s : personnalité, quotidien, matériel et portfolio de contenus. TTP Creators." % de(title)
    og = og_tags(title + " · Media kit UGC", desc, canonical, apercu(slug), "Couverture du media kit " + de(title))
    return """<!doctype html>
<html lang="fr"{theme}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Media kit UGC TTP Creators</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
{og}
<link rel="icon" type="image/png" sizes="32x32" href="../../../assets/favicon-32.png?v=2">
<link rel="apple-touch-icon" href="../../../assets/favicon-180.png?v=2">
<link rel="stylesheet" href="../../_assets/mediakit-ugc.css">
</head>
<body>
<div class="kit" id="kit"></div>
<a class="pdf-btn" id="dl-pdf" href="media-kit-ugc-{build}.pdf" download="Media Kit UGC - {title}.pdf" aria-label="Télécharger le media kit UGC en PDF">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
  Télécharger en PDF
</a>
<script>window.MK = {baked};</script>
<script src="../../_assets/mediakit-ugc.js"></script>
</body>
</html>
""".format(theme=theme_attr(mk.get("theme")), title=esc(title), desc=esc(desc), canonical=canonical, og=og, baked=baked, build=BUILD)


def agency_shell(creators, agency=None, slugs=None, lang="fr"):
    """Deck MEDIA KIT AGENCE (mediakit/agence/index.html), direction « Éditorial ».

    Bake window.MK_AGENCY (tous les créateurs actifs + marques + piliers + contenu
    agence éditable) → le moteur agence-editorial.js rend couverture · agence · marques ·
    1 page/créateur · casting · concepts · contact, sans attendre le réseau (PDF
    déterministe). Réutilise kit-editorial.css (polices, thèmes, page 16:9) +
    agence-editorial.css. `slugs` = nom réel → slug de son media kit (lien « Voir son
    media kit complet »).
    """
    slugs = slugs or {}
    # On ne bake que les champs utiles au deck (allège le HTML, pas d'email/tel/etc.).
    slim = [{
        "name": c.get("name"), "handle": c.get("handle"), "niche": c.get("niche"),
        "platform": c.get("platform"), "photo_url": c.get("photo_url"),
        "mediakit": c.get("mediakit") or {}, "slug": slugs.get(c.get("name")),
    } for c in creators]
    # `agency` = blob éditable (intro/piliers/KPIs/contact) saisi dans l'app ; {} → défauts JS.
    baked = json.dumps(
        {"creators": slim, "clients": CLIENTS, "pillars": PILLARS, "agency": agency or {}},
        ensure_ascii=False,
    )
    en = lang == "en"
    base = "https://ttpcreators.pro/mediakit/agence/"
    canonical = base + ("en/" if en else "")
    if en:
        desc = "TTP Creators agency media kit: the full roster of Sport & Lifestyle creators, their audiences and partner brands."
    else:
        desc = "Media kit de l'agence TTP Creators : le roster complet, ses créateurs Sport & Lifestyle, audiences et marques partenaires."
    hreflang, nav = lang_links(base, lang)
    up = "../" if en else ""
    return """<!doctype html>
<html lang="{lang}"{theme}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{page_title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
{hreflang}
{og}
<link rel="icon" type="image/png" sizes="32x32" href="{up}../../assets/favicon-32.png?v=2">
<link rel="apple-touch-icon" href="{up}../../assets/favicon-180.png?v=2">
<link rel="stylesheet" href="{up}../_assets/kit-editorial.css">
<link rel="stylesheet" href="{up}../_assets/agence-editorial.css">
</head>
<body>
<div class="kit" id="kit"></div>
<a class="pdf-btn" id="dl-pdf" href="media-kit-{build}.pdf" download="{pdf_name}" aria-label="{pdf_aria}">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
  {pdf_label}
</a>
{nav}
<div class="progress" id="progress" aria-hidden="true"></div>
<script>window.MK_AGENCY = {baked};</script>
<script src="{up}../_assets/mk-i18n.js"></script>
<script src="{up}../_assets/agence-editorial.js"></script>
</body>
</html>
""".format(lang="en" if en else "fr", theme=kit_theme_attr((agency or {}).get("theme")), desc=esc(desc), build=BUILD,
           baked=baked, canonical=canonical, hreflang=hreflang, nav=nav, up=up,
           page_title="Agency media kit · TTP Creators" if en else "Media kit agence · TTP Creators",
           pdf_name="TTP Creators - Agency Media Kit.pdf" if en else "TTP Creators - Media Kit Agence.pdf",
           pdf_aria="Download the agency media kit as a PDF" if en else "Télécharger le media kit agence en PDF",
           pdf_label="Download PDF" if en else "Télécharger en PDF",
           og=og_tags("Agency media kit · TTP Creators" if en else "Media kit agence · TTP Creators", desc, canonical,
                      apercu("agence", lang),
                      "TTP Creators agency media kit cover" if en else "Couverture du media kit de l'agence TTP Creators",
                      kind="website", lang=lang))


def write_sitemap(slugs, ugc=None):
    """Écrit sitemap.xml à la RACINE du repo (la CI le copie dans dist/).

    Un sitemap ne peut référencer que des URLs de son propre dossier ou en dessous →
    il DOIT être à la racine du site pour couvrir /, /mentions-legales/ et les media
    kits. Régénéré à chaque build (+ cron horaire) → toute nouvelle créatrice y entre
    toute seule. robots.txt le déclare sur https://ttpcreators.pro/sitemap.xml.
    """
    urls = ["https://ttpcreators.pro/", "https://ttpcreators.pro/mentions-legales/"]
    urls += ["https://ttpcreators.pro/mediakit/%s/" % s for s in slugs]
    urls += ["https://ttpcreators.pro/mediakit/%s/en/" % s for s in slugs]
    urls += ["https://ttpcreators.pro/mediakit/%s/ugc/" % s for s in (ugc or [])]
    today = time.strftime("%Y-%m-%d")
    body = "".join("  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n" % (u, today) for u in urls)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n"
    )
    path = os.path.join(os.path.dirname(ROOT), "sitemap.xml")
    with open(path, "w", encoding="utf-8") as f:
        f.write(xml)
    return len(urls)


def main():
    creators = fetch_creators()
    used, out, ugc_out = set(), [], []
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
        os.makedirs(os.path.join(d, "en"), exist_ok=True)
        with open(os.path.join(d, "en", "index.html"), "w", encoding="utf-8") as f:
            f.write(shell(c, slug, "en"))
        out.append((c.get("name"), slug))
        # Page UGC séparée — seulement si le créateur l'a activée dans l'app.
        if (mk.get("ugc") or {}).get("enabled"):
            ud = os.path.join(d, "ugc")
            os.makedirs(ud, exist_ok=True)
            with open(os.path.join(ud, "index.html"), "w", encoding="utf-8") as f:
                f.write(ugc_shell(c, slug))
            ugc_out.append(slug)

    # Deck AGENCE (tous les créateurs dans un seul media kit).
    agency = fetch_agency()
    ag_dir = os.path.join(ROOT, "agence")
    os.makedirs(ag_dir, exist_ok=True)
    with open(os.path.join(ag_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(agency_shell(creators, agency, dict(out)))
    os.makedirs(os.path.join(ag_dir, "en"), exist_ok=True)
    with open(os.path.join(ag_dir, "en", "index.html"), "w", encoding="utf-8") as f:
        f.write(agency_shell(creators, agency, dict(out), "en"))

    print("Pages générées : %d + 1 (agence), chacune en français et en anglais (/en/)" % len(out))
    for name, slug in out:
        print("  /mediakit/%-20s ← %s" % (slug + "/", name))
    print("  /mediakit/agence/           ← Media Kit Agence (%d créateurs bakés)" % len(creators))
    for slug in ugc_out:
        print("  /mediakit/%s/ugc/          ← Media Kit UGC" % slug)

    n = write_sitemap([slug for _, slug in out] + ["agence"], ugc_out)
    print("sitemap.xml : %d URLs (racine du repo → copié dans dist/ par la CI)" % n)


if __name__ == "__main__":
    main()
