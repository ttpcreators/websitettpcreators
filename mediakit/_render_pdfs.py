#!/usr/bin/env python3
"""
Rend chaque page media kit en PDF paysage 16:9 : <base>/mediakit/<slug>/media-kit.pdf.

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


def render(slug):
    out = os.path.join(MK, slug, "media-kit-%s.pdf" % BUILD)
    url = "http://127.0.0.1:%d/mediakit/%s/" % (PORT, slug)
    cmd = [
        CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        "--hide-scrollbars", "--no-pdf-header-footer",
        "--virtual-time-budget=15000",
        "--print-to-pdf=" + out, url,
    ]
    try:
        subprocess.run(cmd, capture_output=True, timeout=120)
    except Exception as e:
        print("  ✗ %-20s (chrome: %s)" % (slug, e))
        return False
    if os.path.exists(out) and os.path.getsize(out) >= MIN_BYTES:
        print("  ✓ %-20s %d Ko" % (slug, os.path.getsize(out) // 1024))
        return True
    print("  ✗ %-20s (PDF vide/absent)" % slug)
    return False


def main():
    if not os.path.isdir(MK):
        print("Aucun dossier %s — rien à rendre." % MK)
        sys.exit(0)
    print("Rendu des PDF depuis : %s" % BASE)
    threading.Thread(target=serve, daemon=True).start()
    time.sleep(1.5)
    names = slugs()
    ok = sum(1 for s in names if render(s))
    print("PDF paysage générés : %d/%d" % (ok, len(names)))
    # Ne jamais faire échouer le déploiement : les shells + le repli window.print()
    # couvrent l'absence d'un PDF. On sort toujours 0.
    sys.exit(0)


if __name__ == "__main__":
    main()
