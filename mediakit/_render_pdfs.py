#!/usr/bin/env python3
"""
Rend chaque page media kit en PDF paysage 16:9 : mediakit/<slug>/media-kit.pdf.

Lancé en CI après _build_mediakits.py, AVANT l'upload Pages. Le bouton
« Télécharger en PDF » des pages pointe directement sur ce fichier → 1 clic,
aucun réglage, aucune boîte de dialogue.

Un serveur http local sert la racine du repo pour que le moteur JS puisse
fetch public_mediakit (données live) et charger les images distantes
(Supabase) — file:// casse ces requêtes. Chrome headless imprime alors la
feuille @media print (via @page size 338.67mm × 190.5mm = 16:9 paysage).

Usage : python3 mediakit/_render_pdfs.py   (depuis la racine du repo)
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

ROOT = os.path.dirname(os.path.abspath(__file__))   # …/mediakit
REPO = os.path.dirname(ROOT)                          # racine du repo
PORT = 8799
CHROME = os.environ.get("CHROME_BIN") or "google-chrome"
MIN_BYTES = 20000   # un PDF valide de 1+ slide pèse largement plus


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=REPO)
    HTTPServer(("127.0.0.1", PORT), handler).serve_forever()


def slugs():
    out = []
    for p in sorted(glob.glob(os.path.join(ROOT, "*", "index.html"))):
        slug = os.path.basename(os.path.dirname(p))
        if slug != "_assets":
            out.append(slug)
    return out


def render(slug):
    out = os.path.join(ROOT, slug, "media-kit.pdf")
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
