/* ============================================================================
 * Media kit AGENCE — moteur de rendu du deck complet (couverture · agence ·
 * marques · 1 diapo par créatrice · contact).
 *
 * Le shell (mediakit/agence/index.html) bake window.MK_AGENCY = { creators,
 * clients, pillars } depuis les données live Supabase (généré en CI par
 * _build_mediakits.py) → rendu DÉTERMINISTE, le PDF (Chrome headless) n'attend
 * aucun fetch réseau. Un rafraîchissement live suit ensuite pour la page web.
 * ========================================================================== */
(function () {
  "use strict";
  var SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co";
  var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3ppZ2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30.5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU";

  var d = document.documentElement;
  d.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function has(v) { return v != null && String(v).trim() !== ""; }
  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(/\s/g, "").replace(",", ".")); return isFinite(n) ? n : 0; }
  function firstName(name) { return String(name || "").trim().split(/\s+/)[0] || ""; }

  // Noms d'affichage personnalisés (une créatrice peut masquer son nom de famille).
  // N'affecte QUE l'affichage — le nom RÉEL reste la clé en base. Idem site (format.js)
  // et kits individuels (mediakit.js NAME_OVERRIDES). Le media kit est PUBLIC → override obligatoire.
  var NAME_OVERRIDES = { "lucie botans": "LUCIE BOTS" };
  function displayName(n) { return NAME_OVERRIDES[String(n || "").trim().toLowerCase()] || n; }

  function monthFR() { try { return new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); } catch (e) { return ""; } }

  // Followers : "406900" → "407K" ; 1 240 000 → "1,2M".
  function fmtK(n) {
    if (n >= 1e6) return String((n / 1e6).toFixed(1)).replace(".", ",").replace(",0", "") + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "K";
    return String(Math.round(n));
  }

  function profileUrl(handle, platform) {
    var h = String(handle || "").replace(/^@/, "").trim();
    var p = String(platform || "").toLowerCase();
    if (p.indexOf("tiktok") >= 0) return "https://www.tiktok.com/@" + h;
    if (p.indexOf("youtube") >= 0) return "https://youtube.com/@" + h;
    if (p.indexOf("snap") >= 0) return "https://www.snapchat.com/add/" + h;
    if (p === "x" || p.indexOf("twitter") >= 0) return "https://x.com/" + h;
    return "https://instagram.com/" + h;
  }

  // Normalise une ligne créatrice → objet d'affichage + stats dérivées.
  function normCreator(row) {
    var mk = (row && row.mediakit) || {};
    var pfs = Array.isArray(mk.platforms) ? mk.platforms : [];
    var ig = pfs.filter(function (p) { return (p.key || "") === "instagram"; })[0] || {};
    var tk = pfs.filter(function (p) { return (p.key || "") === "tiktok"; })[0] || {};
    var xfoll = 0;
    pfs.forEach(function (p) { xfoll += num(p.followers); });
    return {
      name: displayName((row && row.name) || ""),
      handle: String(mk.handle || (row && row.handle) || "").replace(/^@/, ""),
      niche: (row && row.niche) || "",
      platform: (row && row.platform) || "instagram",
      photoUrl: (row && row.photo_url) || null,
      bio: mk.bio || "",
      igER: has(ig.er) ? ig.er : "",
      tkER: has(tk.er) ? tk.er : "",
      xfoll: xfoll,
    };
  }

  function statBlock(n, cap) {
    return '<div class="ag-stat"><div class="n tnum">' + esc(n) + '</div><div class="c">' + cap + "</div></div>";
  }

  // Contenu ÉDITABLE de l'agence (piloté depuis l'app → table agency_mediakit,
  // exposée par la vue anon public_agency_mediakit et bakée dans window.MK_AGENCY.agency).
  // Repli COMPLET sur ces valeurs par défaut si le blob est absent/vide → le deck
  // reste identique tant que rien n'est saisi (et avant que le SQL soit appliqué).
  var AG_DEFAULTS = {
    intro: {
      title: "Talent management\nstratégique",
      lead: "TTP Creators accompagne une sélection de créatrices Sport & Lifestyle : stratégie de carrière, production de contenu et négociation, tout en interne. On construit des identités qui durent — pas des pics de vues.",
    },
    pillars: [
      { title: "Talent d'abord", text: "Une créatrice n'est pas une audience : c'est une marque. On construit une identité qui dure, pas des pics de vues." },
      { title: "Studio intégré", text: "Stratégie, production, négociation : tout se passe en interne. Une seule équipe, aucune perte en ligne." },
      { title: "Résultats mesurés", text: "Pas de feeling : des KPIs clairs et un reporting précis, à chaque collaboration." },
    ],
    kpis: { universes: "02", universesLabel: "Univers · Sport & Lifestyle", platforms: "05", platformsLabel: "Plateformes couvertes" },
    contact: { instagram: "ttp.creators", phone: "07 66 25 98 03", email: "partnerships@ttpcreators.pro" },
  };
  function pick(v, dflt) { return has(v) ? v : dflt; }
  function multiline(s) { return esc(s).replace(/\n/g, "<br>"); }
  function telHref(phone) {
    var p = String(phone || "").replace(/[^\d+]/g, "");
    if (p.charAt(0) === "0") p = "+33" + p.slice(1);
    return "tel:" + p;
  }
  // Fusionne le blob agence édité (window.MK_AGENCY.agency) avec les défauts.
  function agencyData() {
    var a = (window.MK_AGENCY && window.MK_AGENCY.agency) || {};
    var intro = a.intro || {}, kpis = a.kpis || {}, contact = a.contact || {};
    var pillars = Array.isArray(a.pillars) && a.pillars.length ? a.pillars
      : (Array.isArray(window.MK_AGENCY.pillars) && window.MK_AGENCY.pillars.length ? window.MK_AGENCY.pillars : AG_DEFAULTS.pillars);
    return {
      intro: { title: pick(intro.title, AG_DEFAULTS.intro.title), lead: pick(intro.lead, AG_DEFAULTS.intro.lead) },
      pillars: pillars,
      kpis: {
        universes: pick(kpis.universes, AG_DEFAULTS.kpis.universes),
        universesLabel: pick(kpis.universesLabel, AG_DEFAULTS.kpis.universesLabel),
        platforms: pick(kpis.platforms, AG_DEFAULTS.kpis.platforms),
        platformsLabel: pick(kpis.platformsLabel, AG_DEFAULTS.kpis.platformsLabel),
      },
      contact: {
        instagram: String(pick(contact.instagram, AG_DEFAULTS.contact.instagram)).replace(/^@/, ""),
        phone: pick(contact.phone, AG_DEFAULTS.contact.phone),
        email: pick(contact.email, AG_DEFAULTS.contact.email),
      },
    };
  }

  function bioHTML(bio) {
    if (!has(bio)) return "";
    var ps = String(bio).split(/\n\n+/).slice(0, 3).map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("");
    return '<div class="ag-creator-bio">' + ps + "</div>";
  }

  function buildCreator(c) {
    var handle = has(c.handle)
      ? '<a class="ag-creator-handle" href="' + esc(profileUrl(c.handle, c.platform)) + '" target="_blank" rel="noreferrer">@' + esc(c.handle) + "</a>"
      : "";
    var stats = "";
    if (has(c.igER)) stats += statBlock(c.igER, "Taux d'engagement<br>Instagram");
    if (has(c.tkER)) stats += statBlock(c.tkER, "Taux d'engagement<br>TikTok");
    if (c.xfoll > 0) stats += statBlock(fmtK(c.xfoll), "Followers<br>cross-plateformes");
    var statsHTML = stats ? '<div class="ag-stats">' + stats + "</div>" : "";
    var niche = has(c.niche) ? '<span class="ag-niche">' + esc(c.niche) + "</span>" : "";

    var media = c.photoUrl
      ? '<img src="' + esc(c.photoUrl) + '" alt="' + esc(c.name) + '" loading="lazy">'
      : '<span class="ag-photo-note">Portrait<br>— à venir —</span>';

    return '<section class="ag-slide ag-creator">' +
      '<div class="ag-creator-body" data-reveal>' +
        '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">' +
          '<span class="ag-pill">UGC / Influence</span>' + niche + "</div>" +
        '<h2 class="display ag-creator-name">' + esc(c.name) + "</h2>" +
        handle + bioHTML(c.bio) + statsHTML +
      "</div>" +
      '<div class="ag-creator-media">' + media + "</div>" +
      '<span class="ag-mono ag-watermark" aria-hidden="true"></span>' +
      "</section>";
  }

  function buildCover(ag) {
    return '<section class="ag-slide ag-cover">' +
      '<div class="ag-cover-top"><span>TTP Creators</span><span class="js-month">' + monthFR() + "</span></div>" +
      '<div data-reveal>' +
        '<span class="ag-mono ag-cover-mono" aria-hidden="true"></span>' +
        '<hr class="ag-cover-tick">' +
        '<h1 class="display ag-cover-title">Media Kit<br>Agence</h1>' +
        '<p class="ag-cover-handle">@' + esc(ag.contact.instagram) + "</p>" +
      "</div></section>";
  }

  function buildIntro(kpis, ag) {
    var pillars = ag.pillars.map(function (p) {
      return '<div class="ag-pillar"><h3>' + esc(p.title) + "</h3><p>" + esc(p.text) + "</p></div>";
    }).join("");
    var kp = [
      [String(kpis.creators), "Créatrices"],
      [kpis.followers, "Followers cumulés"],
      [ag.kpis.universes, ag.kpis.universesLabel],
      [ag.kpis.platforms, ag.kpis.platformsLabel],
    ].map(function (k) {
      return '<div class="ag-kpi"><div class="n tnum">' + esc(k[0]) + '</div><div class="c">' + esc(k[1]) + "</div></div>";
    }).join("");
    return '<section class="ag-slide ag-intro">' +
      '<div class="ag-intro-head" data-reveal>' +
        '<p class="eyebrow">( 01 ) — L\'agence</p>' +
        '<h2 class="display ag-intro-title">' + multiline(ag.intro.title) + "</h2>" +
        '<p class="ag-intro-lead">' + esc(ag.intro.lead) + "</p>" +
      "</div>" +
      '<div class="ag-pillars" data-reveal>' + pillars + "</div>" +
      '<div class="ag-kpis" data-reveal>' + kp + "</div></section>";
  }

  function buildBrands() {
    var clients = window.MK_AGENCY.clients || [];
    if (!clients.length) return "";
    var logos = clients.map(function (b) {
      var url = "../../assets/clients/" + b.file;
      return '<span class="ag-logo" role="img" aria-label="' + esc(b.name) +
        '" style="-webkit-mask-image:url(' + url + ');mask-image:url(' + url + ')"></span>';
    }).join("");
    return '<section class="ag-slide ag-brands">' +
      '<div class="ag-brands-head" data-reveal>' +
        '<p class="eyebrow">( 02 ) — Partenaires</p>' +
        '<div class="ag-brands-titlerow"><h2 class="display ag-brands-title">Ces marques<br>nous font confiance</h2><hr class="rule"></div>' +
      "</div>" +
      '<div class="ag-logos" data-reveal>' + logos + "</div></section>";
  }

  function buildContact(ag) {
    var ig = ag.contact.instagram, phone = ag.contact.phone, email = ag.contact.email;
    return '<section class="ag-slide ag-contact">' +
      '<div class="ag-contact-text" data-reveal>' +
        '<p class="eyebrow">( 03 ) — Contact</p><h2 class="display ag-contact-title">Let\'s<br>Work !</h2>' +
        '<a class="ag-cblock" href="https://instagram.com/' + esc(ig) + '" target="_blank" rel="noreferrer"><span class="k">Social Media</span><span class="v">@' + esc(ig) + "</span></a>" +
        '<a class="ag-cblock" href="' + esc(telHref(phone)) + '"><span class="k">Mobile</span><span class="v tnum">' + esc(phone) + "</span></a>" +
        '<a class="ag-cblock" href="mailto:' + esc(email) + '"><span class="k">Email</span><span class="v">' + esc(email) + "</span></a>" +
        '<a class="ag-send" href="mailto:' + esc(email) + '">Travaillons ensemble</a>' +
      "</div>" +
      '<div class="ag-contact-media"><span class="ag-mono ag-contact-mono" aria-hidden="true"></span></div>' +
      '<div class="ag-footer"><div>TTP Creators — Talent management stratégique</div>' +
        '<div>Media Kit Agence · <span class="js-month">' + monthFR() + "</span></div></div></section>";
  }

  function build() {
    var raw = (window.MK_AGENCY && window.MK_AGENCY.creators) || [];
    var all = raw.map(normCreator);
    // Filtre qualité : une diapo n'est montrée aux marques que si la créatrice a
    // au moins une bio OU une stat. Les fiches vides (données pas encore saisies
    // dans l'app) sont masquées ici → dès qu'on complète l'app, elles apparaissent.
    var shown = all.filter(function (c) { return has(c.bio) || has(c.igER) || has(c.tkER) || c.xfoll > 0; });
    var skipped = all.filter(function (c) { return !(has(c.bio) || has(c.igER) || has(c.tkER) || c.xfoll > 0); });
    if (skipped.length && window.console) {
      console.info("[media-kit-agence] Fiches masquées (données incomplètes dans l'app) : " +
        skipped.map(function (c) { return c.name; }).join(", "));
    }
    var xtot = 0;
    shown.forEach(function (c) { xtot += c.xfoll; });
    var kpis = { creators: shown.length, followers: fmtK(xtot) };
    var ag = agencyData();

    return buildCover(ag) + buildIntro(kpis, ag) + buildBrands() +
      shown.map(buildCreator).join("") + buildContact(ag);
  }

  var kit = document.getElementById("kit"), bar = document.getElementById("progress"), _io = null;
  function wireReveals(animate) {
    var els = kit.querySelectorAll("[data-reveal]");
    if (_io) { _io.disconnect(); _io = null; }
    if (!animate || reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    _io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); _io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (e) { _io.observe(e); });
  }
  function paint(animate) {
    kit.innerHTML = build();
    wireReveals(animate);
  }
  function onScroll() {
    var h = d.scrollHeight - d.clientHeight, top = d.scrollTop || document.body.scrollTop || 0;
    if (bar) bar.style.width = (h > 0 ? (top / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // 1) Rendu immédiat depuis la donnée COMPLÈTE bakée → PDF déterministe.
  if (!window.MK_AGENCY) window.MK_AGENCY = { creators: [], clients: [], pillars: [], agency: {} };
  paint(true);
  onScroll();

  // 1b) Bouton PDF : href versionné (media-kit-<build>.pdf) baké dans le shell.
  // Repli window.print() si le PDF n'est pas encore rendu.
  (function () {
    var btn = document.getElementById("dl-pdf");
    if (!btn) return;
    var href = btn.getAttribute("href");
    try {
      fetch(href, { method: "HEAD" })
        .then(function (r) { if (!r.ok) throw 0; })
        .catch(function () {
          btn.removeAttribute("href");
          btn.removeAttribute("download");
          btn.setAttribute("role", "button");
          btn.style.cursor = "pointer";
          btn.addEventListener("click", function () { window.print(); });
        });
    } catch (e) {}
  })();

  // 2) Rafraîchissement live (page web) : on relit toutes les créatrices actives
  //    ET le contenu agence édité (intro / piliers / KPIs / contact).
  try {
    fetch(SB_URL + "/rest/v1/public_mediakit?select=name,handle,niche,platform,photo_url,mediakit,sort_order&order=sort_order", {
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (rows && rows.length) {
          window.MK_AGENCY.creators = rows;
          paint(false);
          onScroll();
        }
      })
      .catch(function () {});
  } catch (e) {}
  try {
    fetch(SB_URL + "/rest/v1/public_agency_mediakit?select=data&limit=1", {
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (rows && rows[0] && rows[0].data) {
          window.MK_AGENCY.agency = rows[0].data;
          paint(false);
          onScroll();
        }
      })
      .catch(function () {});
  } catch (e) {}
})();
