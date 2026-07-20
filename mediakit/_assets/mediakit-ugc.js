/* ============================================================================
 * Media kit UGC — moteur de rendu (page /mediakit/<slug>/ugc/).
 * Lit window.MK (baké par le shell) → rend un kit orienté PERSONNE :
 * couverture · présentation · quotidien · matériel · portfolio · collaborations
 * · contact. Puis rafraîchit depuis public_mediakit (anon) pour la version web.
 * Sections sans données = masquées.
 * ========================================================================== */
(function () {
  "use strict";
  var SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co";
  var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3ppZ2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30.5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU";

  var d = document.documentElement;
  d.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CONTACT_EMAIL = "partnerships@ttpcreators.pro";
  var NAME_OVERRIDES = { "lucie botans": "LUCIE BOTS" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function has(v) { return v != null && String(v).trim() !== ""; }
  function arr(a) { return Array.isArray(a) ? a.filter(function (x) { return has(x); }) : []; }
  function displayName(n) { return NAME_OVERRIDES[String(n || "").trim().toLowerCase()] || n; }
  function firstName(n) { return String(n || "").trim().split(/\s+/)[0] || ""; }

  function normalize(row) {
    var mk = (row && row.mediakit) || {};
    var u = mk.ugc || {};
    return {
      name: displayName((row && row.name) || ""),
      handle: String(u.handle || mk.handle || (row && row.handle) || "").replace(/^@/, ""),
      followers: u.followers || "",
      photo: (mk.photos && mk.photos.hero) || (row && row.photo_url) || null,
      enabled: !!u.enabled,
      intro: u.intro || "",
      region: u.region || "", home: u.home || "", pets: u.pets || "", sports: u.sports || "",
      gear: arr(u.gear), collabs: arr(u.collabs), portfolio: arr(u.portfolio),
    };
  }

  function buildCover(x) {
    var photo = x.photo
      ? '<img class="u-cover-photo" src="' + esc(x.photo) + '" alt="' + esc(x.name) + '" loading="eager">'
      : "";
    return '<section class="u-slide u-cover">' +
      '<div class="u-cover-top"><span>TTP Creators</span><span>Créateur UGC</span></div>' +
      '<div class="u-cover-mid" data-reveal>' + photo +
        '<h1 class="display u-cover-name">' + esc(x.name) + "</h1>" +
        (has(x.handle) ? '<div class="u-cover-handle">@' + esc(x.handle) + "</div>" : "") +
      "</div>" +
      '<div class="u-cover-bot"><span>Media Kit UGC</span></div></section>';
  }

  function buildIntro(x) {
    if (!has(x.intro)) return "";
    return '<section class="u-slide u-sheet"><div class="u-head" data-reveal>' +
      '<h2 class="display u-title">Qui je suis</h2><hr class="rule"></div>' +
      '<p class="u-lead" data-reveal>' + esc(x.intro) + "</p></section>";
  }

  function buildDaily(x) {
    var facts = [["Région", x.region], ["Logement", x.home], ["Animaux", x.pets], ["Sports & activités", x.sports]]
      .filter(function (f) { return has(f[1]); });
    if (!facts.length) return "";
    var cells = facts.map(function (f) {
      return '<div class="u-fact"><div class="k">' + esc(f[0]) + '</div><div class="v">' + esc(f[1]) + "</div></div>";
    }).join("");
    return '<section class="u-slide u-sheet"><div class="u-head" data-reveal>' +
      '<h2 class="display u-title">Mon quotidien</h2><hr class="rule"></div>' +
      '<div class="u-facts" data-reveal>' + cells + "</div></section>";
  }

  function buildGear(x) {
    if (!x.gear.length) return "";
    var chips = x.gear.map(function (g) { return '<span class="u-chip">' + esc(g) + "</span>"; }).join("");
    return '<section class="u-slide u-sheet"><div class="u-head" data-reveal>' +
      '<h2 class="display u-title">Mon matériel</h2><hr class="rule"></div>' +
      '<div class="u-chips" data-reveal>' + chips + "</div></section>";
  }

  function buildPortfolio(x) {
    if (!x.portfolio.length) return "";
    var shots = x.portfolio.map(function (u) {
      return '<div class="u-shot"><img src="' + esc(u) + '" alt="Contenu UGC" loading="lazy"></div>';
    }).join("");
    return '<section class="u-slide u-sheet"><div class="u-head" data-reveal>' +
      '<h2 class="display u-title">Mes contenus</h2><hr class="rule">' +
      '<span class="eyebrow">' + x.portfolio.length + " visuel" + (x.portfolio.length > 1 ? "s" : "") + "</span></div>" +
      '<div class="u-portfolio" data-reveal>' + shots + "</div></section>";
  }

  function buildCollabs(x) {
    if (!x.collabs.length) return "";
    var chips = x.collabs.map(function (c) { return '<span class="u-chip solid">' + esc(c) + "</span>"; }).join("");
    return '<section class="u-slide u-sheet"><div class="u-head" data-reveal>' +
      '<h2 class="display u-title">Ils m\'ont fait confiance</h2><hr class="rule"></div>' +
      '<div class="u-chips" data-reveal>' + chips + "</div></section>";
  }

  function buildContact(x) {
    var meta = "";
    if (has(x.handle)) meta += '<div class="u-cline"><div class="k">Réseau</div><a class="v" href="https://instagram.com/' + esc(x.handle) + '" target="_blank" rel="noreferrer">@' + esc(x.handle) + "</a></div>";
    if (has(x.followers)) meta += '<div class="u-cline"><div class="k">Communauté (indicatif)</div><span class="v">' + esc(x.followers) + "</span></div>";
    meta += '<div class="u-cline"><div class="k">Email</div><a class="v" href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + "</a></div>";
    return '<section class="u-slide u-contact">' +
      '<div data-reveal><p class="eyebrow">Contact</p><h2 class="display u-contact-title">Travaillons<br>ensemble</h2></div>' +
      '<div class="u-contact-meta" data-reveal>' + meta + "</div>" +
      '<a class="u-send" data-reveal href="mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent("Collab UGC — " + firstName(x.name)) + '">Me contacter</a>' +
      '<div class="u-footer">TTP Creators · Trust the Process · ttpcreators.pro</div></section>';
  }

  function build(x) {
    if (!x.enabled) {
      return '<section class="u-slide u-cover"><div class="u-cover-mid"><p class="eyebrow">Media Kit UGC</p>' +
        '<h1 class="display u-cover-name">' + esc(x.name || "Bientôt") + '</h1><div class="u-cover-handle">En préparation</div></div></section>';
    }
    return buildCover(x) + buildIntro(x) + buildDaily(x) + buildGear(x) + buildPortfolio(x) + buildCollabs(x) + buildContact(x);
  }

  var kit = document.getElementById("kit"), _io = null;
  function wireReveals(animate) {
    var els = kit.querySelectorAll("[data-reveal]");
    if (_io) { _io.disconnect(); _io = null; }
    if (!animate || reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    _io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); _io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { _io.observe(e); });
  }
  function paint(x, animate) { kit.innerHTML = build(x); wireReveals(animate); }

  // 1) rendu immédiat depuis window.MK (baké, déterministe pour le PDF)
  var baked = normalize(window.MK || {});
  paint(baked, false);

  // 2) rafraîchissement web depuis public_mediakit (par NOM réel)
  var realName = (window.MK && window.MK.name) || "";
  if (realName && SB_KEY.indexOf("PLACE") < 0) {
    fetch(SB_URL + "/rest/v1/public_mediakit?select=name,handle,platform,photo_url,mediakit&name=eq." + encodeURIComponent(realName), {
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) { if (rows && rows[0]) paint(normalize(rows[0]), true); })
      .catch(function () {});
  }
})();
