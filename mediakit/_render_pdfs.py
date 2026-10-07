#!/usr/bin/env python3
"""
Rend chaque page media kit en PDF paysage 16:9 : <base>/mediakit/<slug>/media-kit.pdf,
puis son aperçu de partage 1200×630 (mode ?og=1) : <base>/mediakit/<slug>/apercu-<build>.jpg.

Lancé en CI après le build React + la génération des pages media kit, AVANT
l'upload Pages. Le bouton « Télécharger en PDF » des pages pointe directement
sur ce fichier → 1 clic, aucun réglage, aucune boîte de dialogue.

Racine servie = SERVE_DIR si défini (ex. `dist` en CI, après `cp -r mediakit
dist/mediakit`), sinon la racine du repo (usage local autonome). Un serveur http
local est nécessaire pour que le moteur JS puisse fetch public_mediakit (données
live) et charger les images distantes (Supabase) — file:// casse ces requêtes.
Chrome imprime la feuille @media print (@page 338.67mm × 190.5mm = 16:9 paysage).

Usage : python3 mediakit/_render_pdfs.py            (sert la racine du repo)
        SERVE_DIR=dist python3 mediakit/_render_pdfs.py   (sert le build)
Nécessite Google Chrome (préinstallé sur ubuntu-latest ; override CHROME_BIN).
"""
import functools
import glob
import os
import shutil
import subprocess
import sys
import threading
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))   # …/mediakit
REPO = os.path.dirname(SCRIPT_DIR)                          # racine du repo
BASE = os.path.abspath(os.environ.get("SERVE_DIR") or REPO)  # racine servie
MK = os.path.join(BASE, "mediakit")                        # dossier media kit servi
PORT = 8799
CHROME = os.environ.get("CHROME_BIN") or "google-chrome"
MIN_BYTES = 20000   # un PDF valide de 1+ slide pèse largement plus
# Nom de PDF versionné (media-kit-<build>.pdf) → URL unique par déploiement, jamais servie
# périmée par un cache CDN. DOIT correspondre au BUILD de _build_mediakits.py (même job CI).
BUILD = (os.environ.get("GITHUB_SHA") or "dev")[:12]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=BASE)
    HTTPServer(("127.0.0.1", PORT), handler).serve_forever()


def slugs():
    out = []
    for p in sorted(glob.glob(os.path.join(MK, "*", "index.html"))):
        slug = os.path.basename(os.path.dirname(p))
        if slug != "_assets":
            out.append(slug)
    return out


def ugc_slugs():
    """Créateurs ayant une page UGC (mediakit/<slug>/ugc/index.html)."""
    out = []
    for p in sorted(glob.glob(os.path.join(MK, "*", "ugc", "index.html"))):
        out.append(os.path.basename(os.path.dirname(os.path.dirname(p))))
    return out


def render(url_path, out_file, label):
    """Rend l'URL `url_path` (relative au serveur local) en PDF `out_file`."""
    url = "http://127.0.0.1:%d/%s" % (PORT, url_path)
    cmd = [
        CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        "--hide-scrollbars", "--no-pdf-header-footer",
        "--virtual-time-budget=15000",
        "--print-to-pdf=" + out_file, url,
    ]
    try:
        subprocess.run(cmd, capture_output=True, timeout=120)
    except Exception as e:
        print("  ✗ %-24s (chrome: %s)" % (label, e))
        return False
    if os.path.exists(out_file) and os.path.getsize(out_file) >= MIN_BYTES:
        print("  ✓ %-24s %d Ko" % (label, os.path.getsize(out_file) // 1024))
        return True
    print("  ✗ %-24s (PDF vide/absent)" % label)
    return False


OG_MIN_BYTES = 15000   # une carte 1200×630 avec photo pèse bien plus


def render_og(slug):
    """Carte d'aperçu de partage (WhatsApp, iMessage, LinkedIn…) : la page en mode ?og=1
    capturée en JPEG 1200×630 → mediakit/<slug>/apercu-<build>.jpg (og:image du shell).
    Si la capture échoue, on pose l'image générale du site sous ce nom : un aperçu
    générique vaut mieux qu'un aperçu cassé."""
    out = os.path.join(MK, slug, "apercu-%s.jpg" % BUILD)
    url = "http://127.0.0.1:%d/mediakit/%s/?og=1" % (PORT, slug)
    cmd = [
        CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        "--force-device-scale-factor=1", "--window-size=1200,630",
        "--virtual-time-budget=12000", "--screenshot=" + out, url,
    ]
    try:
        subprocess.run(cmd, capture_output=True, timeout=90)
    except Exception as e:
        print("  ✗ %-24s (chrome: %s)" % (slug + " (aperçu)", e))
    if os.path.exists(out) and os.path.getsize(out) >= OG_MIN_BYTES:
        print("  ✓ %-24s %d Ko" % (slug + " (aperçu)", os.path.getsize(out) // 1024))
        return True
    for fb in (os.path.join(BASE, "og-ttp.jpg"), os.path.join(REPO, "public", "og-ttp.jpg")):
        if os.path.exists(fb):
            shutil.copyfile(fb, out)
            break
    print("  ✗ %-24s (capture ratée : image générale du site à la place)" % (slug + " (aperçu)"))
    return False


def main():
    if not os.path.isdir(MK):
        print("Aucun dossier %s — rien à rendre." % MK)
        sys.exit(0)
    print("Rendu des PDF depuis : %s" % BASE)
    threading.Thread(target=serve, daemon=True).start()
    time.sleep(1.5)
    names = slugs()
    ok = sum(1 for s in names if render("mediakit/%s/" % s, os.path.join(MK, s, "media-kit-%s.pdf" % BUILD), s))
    ugc = ugc_slugs()
    ok_ugc = sum(
        1 for s in ugc
        if render("mediakit/%s/ugc/" % s, os.path.join(MK, s, "ugc", "media-kit-ugc-%s.pdf" % BUILD), s + " (ugc)")
    )
    print("PDF paysage générés : %d/%d (+ %d/%d UGC)" % (ok, len(names), ok_ugc, len(ugc)))
    # Seules les pages du moteur actuel déclarent une carte (les anciens shells encore en
    # ligne, créateurs retirés de l'app, gardent leur photo comme aperçu).
    og_names = [s for s in names if "apercu-" in open(os.path.join(MK, s, "index.html"), encoding="utf-8").read()]
    ok_og = sum(1 for s in og_names if render_og(s))
    print("Aperçus de partage générés : %d/%d" % (ok_og, len(og_names)))
    # Ne jamais faire échouer le déploiement : les shells + le repli window.print()
    # couvrent l'absence d'un PDF. On sort toujours 0.
    sys.exit(0)


if __name__ == "__main__":
    main()
