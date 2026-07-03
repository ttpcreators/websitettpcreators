# -*- coding: utf-8 -*-
# Générateur du nouveau index.html (style cinématique / verre) pour TTP Creators
VIDEO = "https://cdn.sceneai.art/Hero%20Section%20Video/1bc60917-cb77-4441-bc15-bb839a9dd6c2.mp4"

NAV = [("#about","À propos",True),("#services","Services",False),("#roster","Créatrices",False),("#contact","Contact",False)]

LOGOS = [("tesla","Tesla"),("ray-ban","Ray-Ban"),("hp","HP"),("speedo","Speedo"),
("palladium","Palladium"),("bumble","Bumble"),("magnum","Magnum"),("quonto","Qonto"),
("nutripure","Nutripure"),("so-shape","So Shape"),("novoma","Novoma")]

ROSTER = [
("mathilde","Mathilde Viot","mathild.e_","Sport"),
("margaux","Margaux Bekhdadi","maybefeelgood_","Sport"),
("candice","Candice Maissa","candicemaissa","Lifestyle"),
("justine","Justine Flotte","jufrasca__","Lifestyle"),
("lena","Léna Pasquale","lenaa.psl","Sport"),
("irina","Irina Sambucini","irina.smb","Lifestyle"),
("lucie","Lucie Botans","lucie.bots","Lifestyle"),
("beverly","Beverly Filoni","beverly.filoni","Lifestyle"),
]

IG = ('<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" '
'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/>'
'<circle cx="12" cy="12" r="3.8"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>')
TT = ('<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">'
'<path d="M16.6 2h-2.9v13.7a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12v-3a5.6 5.6 0 1 0 6.7 5.5V9.3a7 7 0 0 0 4.1 1.32V7.7a4.1 4.1 0 0 1-3.1-1.4A4.1 4.1 0 0 1 16.6 2z"/></svg>')
ARROW = ('<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" '
'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>')

def nav_links(active_ok=True):
    out=[]
    for href,label,active in NAV:
        cls="nlink active" if (active and active_ok) else "nlink"
        out.append(f'<a href="{href}" class="{cls}">{label}</a>')
    return "".join(out)

# ---- Bannière logos (x2 pour boucle) ----
def logo_item(slug,name):
    return (f'<div class="logo-item"><img class="cl" src="assets/clients/{slug}.png" alt="{name}" loading="lazy" '
            f'onerror="this.replaceWith(document.createTextNode(\'{name}\'))"><span class="logo-dot"></span></div>')
logos_track = "".join(logo_item(s,n) for s,n in LOGOS)*2

# ---- Roster cards ----
def roster_card(slug,name,handle,niche):
    ig="https://instagram.com/"+handle
    tk="https://tiktok.com/@"+handle
    return f'''<article class="cr" data-reveal>
  <div class="cr-media">
    <img src="assets/creators/{slug}.png" alt="{name}" loading="lazy" onerror="this.style.display='none'">
    <span class="cr-badge">{niche}</span>
    <div class="cr-ov">
      <div class="cr-actions">
        <a href="{ig}" target="_blank" rel="noopener" aria-label="Instagram de {name}" class="cr-ic">{IG}</a>
        <a href="{tk}" target="_blank" rel="noopener" aria-label="TikTok de {name}" class="cr-ic">{TT}</a>
        <a href="#contact" class="cr-collab">Collaborer {ARROW}</a>
      </div>
    </div>
  </div>
  <div class="cr-meta"><div class="cr-name">{name}</div><div class="cr-handle">@{handle}</div></div>
</article>'''
roster_html = "\n".join(roster_card(*r) for r in ROSTER)

SERVICES = [
("Talent Management","Carrière, négociations, planning et développement de revenus. On gère, tu crées.",["Carrière","Deals","Planning"],"big"),
("Production de contenu","Direction artistique, tournage, montage, photo. Du contenu prêt à publier.",["Photo","Vidéo"],""),
("Stratégie social media","Ligne éditoriale, formats, calendrier et lecture des performances.",["Édito","Calendrier","Analytics"],""),
("Partenariats marques","Sourcing, brief, activation et reporting. On connecte les bons talents aux bonnes marques.",["Sourcing","Campagnes","Reporting"],""),
]
def svc(title,desc,tags,big):
    tg="".join(f'<span class="tag">{t}</span>' for t in tags)
    return f'''<div class="glass card svc {big}" data-reveal>
  <h3>{title}</h3><p>{desc}</p><div class="tags">{tg}</div>
</div>'''
services_html="\n".join(svc(*s) for s in SERVICES)

METHOD=[("01","Découverte","On apprend à te connaître : objectifs, audience, positionnement."),
("02","Stratégie","On pose la ligne, les formats et le plan de croissance."),
("03","Production","On crée le contenu et on l'optimise pour chaque plateforme."),
("04","Croissance","On mesure, on ajuste, et on active les bonnes marques.")]
method_html="\n".join(f'''<div class="step" data-reveal><div class="step-n">{n}</div><h3>{t}</h3><p>{d}</p></div>''' for n,t,d in METHOD)

PLATS=[("snap","#FFFC00",'<path d="M12 2.2c2.7 0 4 2 4 4.6 0 .8-.1 1.5-.1 1.8.2.1.6.1 1 0 .6-.1.8.5.4.9-.3.3-1.1.5-1.3.9-.2.5 1.1 2.7 3 3 .4.1.4.5 0 .7-.5.3-1.5.3-1.8.8-.1.3.1.7-.2.9-.3.2-1-.1-1.7 0-.7.1-1.2.8-2.5.8s-1.8-.7-2.5-.8c-.7-.1-1.4.2-1.7 0-.3-.2-.1-.6-.2-.9-.3-.5-1.3-.5-1.8-.8-.4-.2-.4-.6 0-.7 1.9-.3 3.2-2.5 3-3-.2-.4-1-.6-1.3-.9-.4-.4-.2-1 .4-.9.4.1.8 0 1-.1 0-.3-.1-1-.1-1.8C8 4.2 9.3 2.2 12 2.2z"/>',44),
("tiktok","#f2f3f5",'<path d="M16.6 2h-2.9v13.7a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12v-3a5.6 5.6 0 1 0 6.7 5.5V9.3a7 7 0 0 0 4.1 1.32V7.7a4.1 4.1 0 0 1-3.1-1.4A4.1 4.1 0 0 1 16.6 2z"/>',56),
("ig","none",'',68),
("yt","#FF3B30",'<rect x="2" y="5" width="20" height="14" rx="4.5" fill="#FF3B30"/><path d="M10 8.5l6 3.5-6 3.5z" fill="#fff"/>',56),
("twitch","#a970ff",'<path d="M4.3 3 3 6.4v12.1h4.1V21h2.3l2.3-2.5h3.4L23 13V3H4.3zm15.6 9.2-2.7 2.7h-4.1l-2.3 2.3v-2.3H7.6V5h12.3v7.2zM16.6 7.6h-1.7v4.6h1.7V7.6zm-4.6 0h-1.7v4.6H12V7.6z"/>',44)]
def plat_ic(key,color,path,size,i):
    inner=path if path else '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#f2f3f5" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="#f2f3f5" stroke-width="1.7"/><circle cx="17.4" cy="6.6" r="1.1" fill="#f2f3f5"/>'
    sz=int(size*0.5)
    return f'<div class="plat-ic" style="width:{size}px;height:{size}px;animation-delay:{i*0.25}s"><svg width="{sz}" height="{sz}" viewBox="0 0 24 24" fill="{color}" aria-hidden="true">{inner}</svg></div>'
plat_html="".join(plat_ic(*p,i) for i,p in enumerate(PLATS))

# ---- World map arcs (reprise) ----
ARCS=[("M410.7 98.3 Q405.2 35.6 399.7 85.6","0s"),("M410.7 98.3 Q323.2 48.3 235.6 109.5",".5s"),
("M235.6 109.5 Q186.4 59.5 137.2 124.3","1.1s"),("M413.6 97.3 Q468.2 47.3 522.8 144.0",".8s"),
("M410.7 98.3 Q353.6 48.3 296.4 252.3","1.5s")]
DOTS=[(137.2,124.3,3,".2s","var(--accent)"),(235.6,109.5,3,".6s","var(--accent)"),(399.7,85.6,3,"1s","var(--accent)"),
(522.8,144.0,3,"1.3s","var(--accent)"),(296.4,252.3,3,"1.7s","var(--accent)"),(410.7,98.3,3.4,"0s","#fff"),(413.6,97.3,3,"0s","#fff")]
arcs_svg="".join(f'<path class="wm-arc" pathLength="100" d="{d}" style="animation-delay:{dl}"/>' for d,dl in ARCS)
dots_svg=""
for x,y,r,dl,c in DOTS:
    if c=="var(--accent)":
        dots_svg+=f'<circle class="wm-ring" cx="{x}" cy="{y}" r="3" style="animation-delay:{dl}"/><circle class="wm-dot" cx="{x}" cy="{y}" r="2.4"/>'
    else:
        dots_svg+=f'<circle class="wm-dot" cx="{x}" cy="{y}" r="{r}" style="fill:#fff"/>'

STATS=[("+","50","","Campagnes livrées","0"),("","99","%","Satisfaction clients","0"),
("","8","","Créatrices signées","2"),("","5","","Plateformes couvertes","2")]
stats_html="".join(
 f'<div class="stat" data-reveal><div class="stat-n" data-counter data-target="{t}" data-prefix="{p}" data-suffix="{s}" data-pad="{pad}">{p}{"0"*max(1,int(pad))}{s}</div><div class="stat-l">{l}</div></div>'
 for p,t,s,l,pad in STATS)

CSS = open("_style.css",encoding="utf-8").read()

HTML = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>TTP Creators — Talent management Sport & Lifestyle | Lyon · Genève</title>
<meta name="description" content="TTP Creators, agence de talent management Sport et Lifestyle entre Lyon et Genève. On transforme les créateurs en marques.">
<link rel="canonical" href="https://ttpcreators.github.io/websitettpcreators/">
<meta property="og:title" content="TTP Creators — Talent management">
<meta property="og:description" content="On transforme les créateurs en marques. Sport, Lifestyle, Fashion. Lyon · Genève.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0a0a0c">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png?v=2">
<link rel="apple-touch-icon" href="assets/favicon-180.png?v=2">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"Organization","name":"TTP Creators","url":"https://ttpcreators.github.io/websitettpcreators/","description":"Agence de talent management Sport et Lifestyle à Lyon et Genève.","areaServed":["Lyon","Genève"],"email":"partnerships@ttpcreators.pro","sameAs":["https://www.instagram.com/ttpcreators/","https://www.linkedin.com/company/ttp-creators/"]}}
</script>
<style>{CSS}</style>
</head>
<body>

<!-- ============ HERO ============ -->
<section class="hero" data-hero>
  <video class="hero-video" autoplay loop muted playsinline poster="og-image.png">
    <source src="{VIDEO}" type="video/mp4">
  </video>
  <div class="hero-tint"></div>
  <div class="hero-glow" data-glow></div>

  <header class="header" data-header>
    <a href="#hero" class="brand" aria-label="TTP Creators, accueil"><img src="assets/logo.png" alt="TTP Creators" onerror="this.replaceWith(document.createTextNode('TTP'))"></a>
    <nav class="nav-pill" aria-label="Navigation principale">{nav_links()}</nav>
    <a href="#contact" class="btn btn-accent cta-desktop">Travailler avec nous {ARROW}</a>
    <button class="burger" data-burger type="button" aria-label="Ouvrir le menu" aria-expanded="false">
      <span></span><span></span>
    </button>
  </header>

  <div class="menu" data-menu>
    <nav class="menu-links">{nav_links(False)}</nav>
    <a href="#contact" class="btn btn-accent">Travailler avec nous {ARROW}</a>
  </div>

  <main class="hero-main">
    <div class="hero-type">
      <span class="eyebrow light">— Talent management</span>
      <h1><span class="l1">Trust the</span><span class="l2">Process.</span></h1>
    </div>
    <div class="hero-right">
      <p>Talent management Sport &amp; Lifestyle, entre Lyon et Genève. On transforme les créateurs en marques.</p>
      <a href="#roster" class="btn btn-white btn-wide">Voir le roster {ARROW}</a>
    </div>
  </main>
</section>

<!-- ============ CONFIANCE ============ -->
<section class="band" aria-label="Ils nous font confiance">
  <div class="wrap band-label">Ils nous font confiance</div>
  <div class="marquee"><div class="marquee-track">{logos_track}</div></div>
</section>

<!-- ============ À PROPOS ============ -->
<section id="about" class="sec">
  <div class="wrap">
    <div class="eyebrow" data-reveal><b>(01)</b><i></i>À propos</div>
    <div class="about-grid">
      <div class="about-photo glass" data-reveal>
        <img src="assets/about/equipe.jpg" alt="L'équipe TTP Creators" loading="lazy" onerror="this.remove()">
      </div>
      <div class="about-txt" data-reveal>
        <h2>Une agence pensée comme un studio, au service des créateurs.</h2>
        <p class="lead">On structure les talents et on construit des campagnes qui performent. Lyon · Genève.</p>
        <div class="pillars">
          <div class="pillar"><span class="pn">01</span><div><h3>Talent d'abord</h3><p>Une marque, pas qu'une audience. Des talents qui matchent vraiment l'image.</p></div></div>
          <div class="pillar"><span class="pn">02</span><div><h3>Studio intégré</h3><p>Stratégie, production, négociation. Une équipe. Aucune sous-traitance.</p></div></div>
          <div class="pillar"><span class="pn">03</span><div><h3>Résultats mesurés</h3><p>Pas de feeling. Des KPIs clairs, à chaque collaboration.</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ SERVICES ============ -->
<section id="services" class="sec">
  <div class="wrap">
    <div class="eyebrow" data-reveal><b>(02)</b><i></i>Services</div>
    <h2 class="sec-title" data-reveal>Un accompagnement complet, du talent à la marque.</h2>
    <div class="bento">
      {services_html}
      <div class="glass card plat" data-reveal>
        <div class="plat-stage"><div class="plat-row">{plat_html}</div><span class="plat-beam"><i></i><i></i><i></i></span></div>
        <div class="plat-txt">
          <h3>Un seul créateur, plusieurs plateformes.</h3>
          <p>Instagram, TikTok, YouTube, Snapchat, Twitch. Chaque créateur a son terrain de jeu, on l'accompagne là où il performe.</p>
          <div class="tags"><span class="tag">Instagram</span><span class="tag">TikTok</span><span class="tag">YouTube</span><span class="tag">Snapchat</span><span class="tag">Twitch</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ MÉTHODE ============ -->
<section id="method" class="sec">
  <div class="wrap">
    <div class="eyebrow" data-reveal><b>(03)</b><i></i>Notre méthode</div>
    <h2 class="sec-title" data-reveal>Quatre étapes, un process éprouvé.</h2>
    <div class="steps">{method_html}</div>
  </div>
</section>

<!-- ============ RÉSEAU ============ -->
<section id="network" class="sec">
  <div class="wrap">
    <div class="eyebrow" data-reveal><b>(04)</b><i></i>Notre réseau</div>
    <div class="net-grid">
      <div class="net-txt" data-reveal>
        <h2>De Lyon &amp; Genève,<br>on connecte les talents au monde.</h2>
        <p class="lead">Nos créatrices collaborent avec des marques partout dans le monde. Campagnes locales ou activations internationales, on relie les bons talents aux bons marchés.</p>
      </div>
      <div class="net-map" data-reveal>
        <img src="assets/world-dotted.svg" alt="" aria-hidden="true" loading="lazy" class="net-dots">
        <svg viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true" class="net-arcs">
          <defs><linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0"/><stop offset="12%" stop-color="var(--accent)"/>
            <stop offset="88%" stop-color="#e39aa8"/><stop offset="100%" stop-color="#e39aa8" stop-opacity="0"/></linearGradient></defs>
          {arcs_svg}<g>{dots_svg}</g>
        </svg>
      </div>
    </div>
  </div>
</section>

<!-- ============ STATS ============ -->
<section class="sec sec-tight" aria-label="Chiffres clés">
  <div class="wrap"><div class="glass stats" data-reveal>{stats_html}</div></div>
</section>

<!-- ============ CRÉATRICES ============ -->
<section id="roster" class="sec">
  <div class="wrap">
    <div class="roster-head">
      <div>
        <div class="eyebrow" data-reveal><b>(05)</b><i></i>Créatrices</div>
        <h2 class="sec-title" data-reveal>Le roster.</h2>
      </div>
      <p class="roster-sub" data-reveal>Huit créatrices, deux univers : Sport et Lifestyle. Survole une carte pour collaborer.</p>
    </div>
    <div class="roster-grid">{roster_html}</div>
  </div>
</section>

<!-- ============ HISTOIRE ============ -->
<section id="story" class="sec">
  <div class="wrap">
    <div class="eyebrow" data-reveal><b>(06)</b><i></i>Notre histoire</div>
    <div class="story-grid">
      <div data-reveal>
        <h2>La suite logique d'une agence de communication.</h2>
        <p class="lead">En 2022, on lance <b>TTP Agency</b>, une agence de communication. À force de construire des marques et des campagnes, une évidence s'impose : ce sont désormais les créateurs qui façonnent la culture.</p>
        <p class="lead"><b>TTP Creators</b> en est le prolongement naturel : le même savoir-faire d'agence, mis au service du management de talents.</p>
      </div>
      <div class="glass card timeline" data-reveal>
        <div class="tl"><span class="tl-dot"></span><div class="tl-year">2022</div><h3>TTP Agency</h3><p>Naissance de l'agence de communication : stratégie de marque, création et campagnes.</p></div>
        <div class="tl"><span class="tl-dot light"></span><div class="tl-year">Aujourd'hui</div><h3>TTP Creators</h3><p>Le talent management comme évidence : les créateurs au cœur des marques.</p></div>
      </div>
    </div>
  </div>
</section>

<!-- ============ CONTACT ============ -->
<section id="contact" class="sec">
  <div class="wrap">
    <div class="glass contact" data-reveal>
      <div class="contact-l">
        <div class="eyebrow"><b>(07)</b><i></i>Contact</div>
        <h2>Parlons de ton projet.</h2>
        <p class="lead">Créateur qui veut une vraie structure, ou marque qui veut activer des talents. On te répond vite.</p>
        <div class="contact-info">
          <a href="mailto:partnerships@ttpcreators.pro" class="ci"><span>Email</span><b>partnerships@ttpcreators.pro</b></a>
          <div class="ci"><span>Localisation</span><b>Lyon &amp; Genève</b></div>
          <div class="ci"><span>Disponibilité</span><b>Réponse sous 48h</b></div>
        </div>
      </div>
      <form class="contact-r" data-form novalidate>
        <input type="hidden" name="profil" value="Créateur">
        <div class="hp"><label>Ne pas remplir<input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>
        <div class="frow">
          <label class="field"><span>Nom</span><input name="nom" type="text" required autocomplete="name"></label>
          <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
        </div>
        <div class="field"><span>Tu es</span><div class="seg"><button type="button" class="segb active" data-seg data-val="Créateur" aria-pressed="true">Créateur</button><button type="button" class="segb" data-seg data-val="Marque" aria-pressed="false">Marque</button></div></div>
        <label class="field"><span>Message</span><textarea name="message" rows="4"></textarea></label>
        <div class="frow-end"><button type="submit" class="btn btn-white btn-wide">Envoyer {ARROW}</button><span class="form-note" data-form-note></span></div>
      </form>
    </div>
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <a href="#hero" class="brand"><img src="assets/logo.png" alt="TTP Creators" onerror="this.replaceWith(document.createTextNode('TTP'))"></a>
      <p class="foot-tag">Talent management Sport &amp; Lifestyle, entre Lyon et Genève. Trust the Process.</p>
      <div class="foot-social">
        <a href="https://www.instagram.com/ttpcreators/" target="_blank" rel="noopener">Instagram {ARROW}</a>
        <a href="https://www.linkedin.com/company/ttp-creators/" target="_blank" rel="noopener">LinkedIn {ARROW}</a>
      </div>
    </div>
    <nav class="foot-nav">
      <div><span>Agence</span><a href="#about">À propos</a><a href="#story">Histoire</a><a href="#method">Méthode</a></div>
      <div><span>Talents</span><a href="#roster">Créatrices</a><a href="#services">Services</a></div>
      <div><span>Contact</span><a href="mailto:partnerships@ttpcreators.pro">Email</a><a href="#contact">Formulaire</a></div>
    </nav>
  </div>
  <div class="wrap foot-bottom"><span>© 2026 TTP Creators. Tous droits réservés.</span></div>
</footer>

<script src="app.js"></script>
</body>
</html>'''

open("index.html","w",encoding="utf-8").write(HTML)
print("index.html généré:", len(HTML), "octets")
