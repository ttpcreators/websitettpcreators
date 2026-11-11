#!/usr/bin/env python3
"""
Version texte de l'accueil pour les robots qui n'exécutent pas le JavaScript.

Le site est une app React : le HTML servi ne contient que <div id="root"></div>.
Google exécute le JavaScript, mais ChatGPT, Claude, Perplexity et souvent Bing ne
le font pas : sans ce script, ils ne lisent AUCUN mot de l'accueil (audit SEO du
2026-11-11).

Ce script, lancé en CI après `vite build` :
  1. sert dist/ en local et le fait afficher par Chrome headless (mode « moins
     d'animations », fenêtre très haute pour que toutes les sections s'affichent) ;
  2. garde du DOM obtenu uniquement le texte et sa structure (titres, paragraphes,
     listes, liens), sans styles, images, boutons ni formulaire ;
  3. complète les deux blocs que le rendu ne donne pas en entier : les chiffres
     clés (compteurs animés, à 0 tant qu'on n'a pas défilé) et les 4 services
     (onglets : un seul texte visible à la fois), à partir de src/data.js ;
  4. glisse le tout dans <div id="root"> de dist/index.html, dans un bloc `hidden`.

Rien ne change pour les visiteurs : le bloc est masqué, et React vide #root au
premier rendu pour y afficher la vraie page. Le contenu est le MÊME que la page
affichée (pas de texte réservé aux robots).

Garde-fous : si Chrome échoue ou si le texte obtenu est trop court (pas de H1,
moins de 250 mots), le script n'écrit rien et sort sans erreur → le déploiement
continue avec l'index.html d'origine.

Usage local : npm run build && python3 scripts/prerender_text.py
CI          : étape « Version texte de l'accueil » de .github/workflows/deploy.yml
"""
import functools
import html
import json
import os
import re
import shutil
import subprocess
import sys
import threading
from html.parser import HTMLParser
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, os.environ.get("SERVE_DIR", "dist"))
PORT = 8791
MARK = "data-seo-text"


def chrome_bin():
    for c in (os.environ.get("CHROME_BIN"), "google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
              "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"):
        if c and (shutil.which(c) or os.path.exists(c)):
            return c
    return None


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    HTTPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=DIST)).serve_forever()


def dump_dom(chrome):
    cmd = [chrome, "--headless", "--disable-gpu", "--no-sandbox", "--force-prefers-reduced-motion",
           "--window-size=1400,24000", "--virtual-time-budget=20000", "--dump-dom",
           "http://127.0.0.1:%d/" % PORT]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout


def site_data():
    """STATS et SERVICES de src/data.js (source unique des textes)."""
    url = "file://" + os.path.join(ROOT, "src", "data.js")
    js = "const m = await import(process.argv[1]); console.log(JSON.stringify({stats: m.STATS, services: m.SERVICES}))"
    out = subprocess.run(["node", "--input-type=module", "-e", js, url], capture_output=True, text=True, timeout=30)
    return json.loads(out.stdout)


def stats_html(stats):
    def fmt(s):
        n = str(s["target"]).rjust(s.get("pad") or 0, "0")
        return "%s%s%s" % (s.get("prefix", ""), n, s.get("suffix", ""))
    items = "".join("<li>%s %s</li>" % (html.escape(fmt(s)), html.escape(s["label"])) for s in stats)
    return '<section aria-label="Chiffres clés"><ul>%s</ul></section>' % items


def services_html(services):
    items = "".join("<h3>%s</h3><p>%s</p>" % (html.escape(s["title"]), html.escape(s["text"])) for s in services)
    return '<section id="services"><h2>Services</h2>%s</section>' % items


# Balises gardées telles quelles (sans attributs, sauf href / id) ; le reste est « déplié ».
KEEP = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "strong", "em", "b", "i",
        "blockquote", "section", "header", "footer", "nav", "dl", "dt", "dd", "br"}
# Sous-arbres ignorés en entier.
SKIP = {"script", "style", "svg", "canvas", "button", "form", "input", "select", "textarea", "label",
        "noscript", "iframe", "video", "audio", "template", "picture"}
VOID = {"br", "img", "hr", "input", "meta", "link", "source", "wbr"}


class Extract(HTMLParser):
    """Garde le texte structuré de <main> et <footer>."""

    def __init__(self, replace):
        super().__init__(convert_charrefs=True)
        self.replace = replace      # id ou aria-label de section → HTML de remplacement
        self.out, self.stack = [], []
        self.zone = False           # dans <main> ou <footer>
        self.skip = 0               # profondeur dans un sous-arbre ignoré

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if not self.zone:
            if tag in ("main", "footer"):
                self.zone = True
                self.stack.append((tag, "zone"))
                if tag == "footer":
                    self.out.append("<footer>")
            return
        if tag in VOID:
            if not self.skip and tag == "img" and a.get("alt"):
                self.out.append(" %s " % html.escape(a["alt"]))
            elif not self.skip and tag == "br":
                self.out.append("<br>")
            return
        if self.skip:
            self.skip += 1
            self.stack.append((tag, "skip"))
            return
        key = a.get("id") or a.get("aria-label")
        if tag == "section" and key in self.replace:
            self.out.append(self.replace[key])
            self.skip += 1
            self.stack.append((tag, "skip"))
            return
        if tag in SKIP or a.get("aria-hidden") == "true" or "hidden" in a:
            self.skip += 1
            self.stack.append((tag, "skip"))
            return
        if tag in KEEP:
            extra = ""
            if tag == "a" and a.get("href") and not a["href"].startswith("javascript:"):
                extra = ' href="%s"' % html.escape(a["href"])
            elif tag == "section" and a.get("id"):
                extra = ' id="%s"' % html.escape(a["id"])
            self.out.append("<%s%s>" % (tag, extra))
            self.stack.append((tag, "keep"))
        else:
            self.out.append(" ")
            self.stack.append((tag, "unwrap"))

    def handle_endtag(self, tag):
        if not self.zone or tag in VOID or not any(t == tag for t, _ in self.stack):
            return
        while self.stack:
            t, kind = self.stack.pop()
            if kind == "skip":
                self.skip -= 1
            elif kind == "keep":
                self.out.append("</%s>" % t)
            elif kind == "unwrap":
                self.out.append(" ")
            elif kind == "zone":
                if t == "footer":
                    self.out.append("</footer>")
                self.zone = False
            if t == tag:
                break

    def handle_data(self, data):
        if self.zone and not self.skip and data.strip():
            self.out.append(html.escape(data))


def clean(fragment):
    s = re.sub(r"\s+", " ", fragment)
    for _ in range(3):                                   # balises vides
        s = re.sub(r"<(\w+)(?: [^>]*)?>\s*</\1>", "", s)
    return s.strip()


def main():
    index = os.path.join(DIST, "index.html")
    if not os.path.exists(index):
        print("prerender_text : %s absent, rien à faire" % index)
        return
    page = open(index, encoding="utf-8").read()
    if MARK in page:
        print("prerender_text : déjà fait")
        return
    chrome = chrome_bin()
    if not chrome:
        print("prerender_text : Chrome introuvable, index.html laissé tel quel")
        return
    threading.Thread(target=serve, daemon=True).start()
    try:
        dom = dump_dom(chrome)
        data = site_data()
    except Exception as e:
        print("prerender_text : échec (%s), index.html laissé tel quel" % e)
        return
    p = Extract({"Chiffres clés": stats_html(data["stats"]), "services": services_html(data["services"])})
    p.feed(dom)
    text = clean("".join(p.out))
    words = len(re.sub(r"<[^>]+>", " ", text).split())
    if "<h1>" not in text or words < 250:
        print("prerender_text : texte trop court (%d mots, H1 %s), index.html laissé tel quel"
              % (words, "présent" if "<h1>" in text else "absent"))
        return
    block = '<div id="root"><div %s hidden>%s</div></div>' % (MARK, text)
    if page.count('<div id="root"></div>') != 1:
        print("prerender_text : <div id=\"root\"></div> introuvable, index.html laissé tel quel")
        return
    with open(index, "w", encoding="utf-8") as f:
        f.write(page.replace('<div id="root"></div>', block))
    print("prerender_text : %d mots ajoutés à dist/index.html pour les robots sans JavaScript" % words)


if __name__ == "__main__":
    main()
    sys.exit(0)
