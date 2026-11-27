#!/usr/bin/env python3
"""
Accueil « Bureau » : roster et marques à jour à chaque déploiement.

L'accueil (index.html) lit ses créateurs et ses marques dans un bloc
<script id="ttp-data" type="application/json">. Ce script, lancé en CI juste après
`vite build` (donc aussi toutes les heures avec le cron du déploiement) :
  1. lit les vues publiques Supabase `public_roster` (créateurs actifs, dans l'ordre
     de l'app) et `public_mediakit` (abonnés par réseau, adresse du media kit, marques
     citées dans « Ces marques lui ont fait confiance ») ;
  2. remplace le bloc ttp-data de dist/index.html par ces données. Les comptes par
     réseau, absents des vues publiques, sont repris du bloc existant ;
  3. réécrit la version texte de l'accueil (<main id="texte">, lue par les robots sans
     JavaScript) : chiffres, liste des créateurs avec leur media kit, marques.

Aucun montant ni aucune donnée privée : seulement ce que les media kits publics montrent déjà.

Garde-fous : si Supabase ne répond pas ou renvoie un roster vide, le script n'écrit rien
et sort sans erreur. L'accueil garde alors le bloc du dépôt (repli).

Usage : npx vite build && python3 scripts/bureau_donnees.py [chemin/vers/index.html]
        (sans chemin : dist/index.html ; avec index.html, met à jour le repli du dépôt)
"""
import html
import json
import os
import re
import sys
import unicodedata
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "index.html")
SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co"
# Clé anon : publique par design (même clé que mediakit/_build_mediakits.py) ; les vues
# n'exposent que des champs publics.
SB_KEY = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3pp"
          "Z2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30"
          ".5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU")
AVATARS = SB_URL + "/storage/v1/object/public/avatars/"
RESEAUX = ("instagram", "tiktok")  # réseaux que l'accueil sait afficher
# Marques dont l'accueil a un logo dessiné (public/assets/clients) : en tête, dans cet ordre
LOGOS = ["Tesla", "Ray-Ban", "HP", "Speedo", "Palladium", "Bumble", "Magnum", "Qonto", "Nutripure", "So Shape", "Novoma"]
# Fautes de frappe repérées dans les media kits : corrigées à l'affichage (à corriger aussi dans l'app)
CORRECTIONS = {"victroria's secret": "Victoria's Secret", "l'oréal": "L'Oréal"}


def get(path):
    req = urllib.request.Request(SB_URL + "/rest/v1/" + path,
                                 headers={"apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def norm(s):
    s = unicodedata.normalize("NFD", str(s or ""))
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower().strip()


def slugify(s):  # identique à mediakit/_build_mediakits.py
    s = unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "createur"


def nom_affiche(n):
    n = " ".join(str(n or "").split())
    return n.title() if (n.isupper() or n.islower()) else n


def nombre(v):
    t = str(v or "").strip().lower().replace(" ", "").replace("\xa0", "").replace(" ", "")
    mult = 1
    if t.endswith("k"):
        mult, t = 1000, t[:-1]
    elif t.endswith("m"):
        mult, t = 1_000_000, t[:-1]
    try:
        return int(round(float(t.replace(",", ".")) * mult))
    except ValueError:
        return 0


def kf(n):  # même affichage que la page : 244510 → « 244,5 K », 1250000 → « 1,25 M »
    if n >= 1_000_000:
        return ("%.2f" % (n / 1e6)).rstrip("0").rstrip(".").replace(".", ",") + " M"
    t = "%.1f" % (n / 1e3)
    return (t[:-2] if t.endswith(".0") else t).replace(".", ",") + " K"


def slugs_media_kits(kits):
    """Adresse /mediakit/<slug>/ de chaque créateur, calculée comme _build_mediakits.py."""
    used, out = set(), {}
    for r in kits:
        mk = r.get("mediakit") or {}
        name = r.get("name") or ""
        base = slugify(mk.get("slug") or (name.split()[0] if name else ""))
        slug, i = base, 2
        while slug in used:
            slug, i = "%s-%d" % (base, i), i + 1
        used.add(slug)
        out[norm(name)] = slug
    return out


def joli(data):
    """Un créateur par ligne : le bloc reste lisible dans index.html."""
    c = data["createurs"]
    lignes = ['{"maj":%s,"createurs":[' % json.dumps(data["maj"])]
    lignes += [json.dumps(x, ensure_ascii=False, separators=(",", ":")) + ("," if i < len(c) - 1 else "") for i, x in enumerate(c)]
    lignes.append('],"marques":' + json.dumps(data["marques"], ensure_ascii=False, separators=(",", ":")) + "}")
    return "\n".join(lignes).replace("</", "<\\/")


def bloc(page, attr, tag, contenu):
    return re.sub(r'(<%s data-texte="%s">)(.*?)(</%s>)' % (tag, attr, tag),
                  lambda m: m.group(1) + contenu + m.group(3), page, count=1, flags=re.S)


def main():
    page = open(PAGE, encoding="utf-8").read()
    m = re.search(r'(<script id="ttp-data" type="application/json">)(.*?)(</script>)', page, re.S)
    if not m:
        print("Bloc ttp-data absent : rien à faire.")
        return 0
    try:
        avant = json.loads(m.group(2).replace("<\\/", "</"))
    except ValueError:
        avant = {}
    try:
        roster = get("public_roster?select=name,handle,niche,platform,photo_url,sort_order&order=sort_order")
        kits = get("public_mediakit?select=name,sort_order,mediakit&order=sort_order")
    except Exception as e:  # réseau, Supabase en panne… : l'accueil garde son repli
        print("Supabase injoignable (%s) : l'accueil garde ses listes de repli." % e)
        return 0
    if not roster:
        print("Roster vide : rien écrit.")
        return 0

    comptes = {norm(c.get("nom")): {r[0]: r[2] for r in c.get("reseaux", []) if len(r) > 2 and r[2]}
               for c in avant.get("createurs", [])}
    slugs = slugs_media_kits(kits)
    contenu = {norm(k.get("name")): (k.get("mediakit") or {}) for k in kits}

    createurs, marques, index = [], [], {}
    for r in roster:
        nom = nom_affiche(r.get("name"))
        mk = contenu.get(norm(r.get("name")), {})
        principal = norm(r.get("platform"))
        compte = (r.get("handle") or "").strip()
        connus = comptes.get(norm(nom), {})
        reseaux = []
        for p in mk.get("platforms") or []:
            cle = norm(p.get("key"))
            n = nombre(p.get("followers"))
            if cle in RESEAUX and n > 0:
                reseaux.append([cle, n, connus.get(cle) or (compte.lstrip("@") if cle == principal and compte else None)])
        reseaux.sort(key=lambda x: -x[1])
        photo = r.get("photo_url") or ""
        if photo.startswith(AVATARS):
            photo = photo[len(AVATARS):]
        createurs.append({"nom": nom, "compte": compte, "niche": (r.get("niche") or "").strip(),
                          "kit": slugs.get(norm(r.get("name"))), "photo": photo or None, "reseaux": reseaux})
        prenom = nom.split()[0] if nom else ""
        for b in mk.get("brands") or []:
            n = " ".join(str(b if isinstance(b, str) else (b or {}).get("name") or "").split())
            if not n:
                continue
            n = CORRECTIONS.get(n.lower(), n)
            k = norm(n)
            if k not in index:
                index[k] = [n, []]
                marques.append(index[k])
            if prenom and prenom not in index[k][1]:
                index[k][1].append(prenom)

    data = {"maj": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "createurs": createurs, "marques": marques}
    page = page[:m.start(2)] + joli(data) + page[m.end(2):]

    # version texte (robots sans JavaScript) : mêmes informations que les fenêtres du bureau
    total = sum(x[1] for c in createurs for x in c["reseaux"])
    logos = {norm(n) for n in LOGOS}
    noms = LOGOS + sorted((n for n, _ in marques if norm(n) not in logos), key=norm)
    k = total / 1000  # même arrondi que la fenêtre Résultats de l'accueil (fmtK)
    cumul = ("%.1f M" % (k / 1000)).replace(".", ",") if k >= 1000 else "%d K" % round(k)
    page = bloc(page, "chiffres", "p", html.escape("%d créateurs, %s d'abonnés cumulés sur Instagram et TikTok, %d marques avec nos créateurs."
                                                   % (len(createurs), cumul, len(noms)), quote=False))
    lis = []
    for c in createurs:
        fans = sum(x[1] for x in c["reseaux"])
        nom = html.escape(c["nom"])
        lien = '<a href="/mediakit/%s/">%s</a>' % (c["kit"], nom) if c["kit"] else nom
        details = ", ".join(x for x in (html.escape(c["compte"]), html.escape(c["niche"]), "%s abonnés" % kf(fans) if fans else "") if x)
        lis.append("\n    <li>%s (%s)</li>" % (lien, details) if details else "\n    <li>%s</li>" % lien)
    page = bloc(page, "createurs", "ul", "".join(lis) + "\n  ")
    page = bloc(page, "marques", "p", html.escape(", ".join(noms) + ".", quote=False))

    with open(PAGE, "w", encoding="utf-8") as f:
        f.write(page)
    print("Accueil à jour : %d créateurs, %d marques (dont %d des media kits), %s d'abonnés."
          % (len(createurs), len(noms), len(marques), kf(total)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
