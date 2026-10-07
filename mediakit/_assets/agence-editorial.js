/* ============================================================================
 * Media kit AGENCE — moteur de rendu, direction « Éditorial » (2026-10-05),
 * même famille que les kits créateurs (kit-editorial.css + agence-editorial.css).
 * Pages : couverture (mosaïque du roster) · l'agence · marques · 1 page par
 * créateur · casting · concepts · contact.
 *
 * Le shell (mediakit/agence/index.html) bake window.MK_AGENCY = { creators,
 * clients, pillars, agency } depuis Supabase (CI, _build_mediakits.py) → rendu
 * immédiat et PDF déterministe ; puis lecture live (anon) pour la page web.
 * Règle : aucune case vide ni « — » : une donnée absente = la ligne disparaît.
 * ========================================================================== */
(function () {
  "use strict";
  var SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co";
  var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3ppZ2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30.5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU";
  var d = document.documentElement;
  // Langue de la page (mk-i18n.js, chargé avant) : FR par défaut, EN sur /mediakit/agence/en/.
  var I = window.MKI18N || { en: false, locale: "fr-FR", val: function (s) { return s; }, L: function (fr) { return fr; },
    list: function (xs) { return xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " et " + xs[xs.length - 1]; } };
  var EN = !!I.en, L = I.L, tv = I.val;

  // Thème choisi dans l'app (agence.theme) ; ?theme=<nom> = aperçu. Mêmes thèmes que les kits créateurs.
  var THEMES = ["blanc", "bordeaux", "sauge", "ivoire", "minuit"];
  var themePreview = (function () { try { return new URLSearchParams(location.search).get("theme"); } catch (e) { return null; } })();
  // ?og=1 : carte d'aperçu de partage 1200×630, capturée en image par la CI (comme les kits créateurs).
  var OG = (function () { try { return new URLSearchParams(location.search).get("og") === "1"; } catch (e) { return false; } })();
  if (OG) d.classList.add("og");
  function applyTheme(t) {
    var v = themePreview || t;
    if (THEMES.indexOf(v) >= 0 && v !== "blanc") d.setAttribute("data-mk-theme", v);
    else d.removeAttribute("data-mk-theme");
  }

  var PLAT_LABEL = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", snapchat: "Snapchat", x: "X" };
  // Noms d'affichage (un créateur peut masquer son nom de famille). Idem kits créateurs et site.
  var NAME_OVERRIDES = { "lucie botans": "LUCIE BOTS" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function has(v) { return v != null && String(v).trim() !== ""; }
  function arr(a) { return Array.isArray(a) && a.length ? a : null; }
  function num(v) {
    var s = String(v == null ? "" : v).trim().toLowerCase().replace(/[\s  ]/g, "").replace(",", ".");
    var m = /^(-?[\d.]+)(k|m)?/.exec(s);
    if (!m) return NaN;
    var n = parseFloat(m[1]);
    if (m[2] === "k") n *= 1e3;
    if (m[2] === "m") n *= 1e6;
    return n;
  }
  function frNum(n, digits) {
    try { return n.toLocaleString(I.locale, { maximumFractionDigits: digits == null ? 1 : digits }); } catch (e) { return String(n); }
  }
  // Grands nombres (format voulu par Marc) : 1 300 → « 1,3K », 919 000 → « 919K », 1 000 000 → « 1M ».
  function compactParts(n) {
    if (!isFinite(n)) return null;
    var a = Math.abs(n), sign = n < 0 ? "-" : "", units = [[1e9, EN ? "B" : "Md"], [1e6, "M"], [1e3, "K"]];
    function one(x) { var s = String(x >= 100 ? Math.round(x) : Math.round(x * 10) / 10); return EN ? s : s.replace(".", ","); }
    for (var i = 0; i < units.length; i++) {
      if (a < units[i][0] && Math.round(a) < units[i][0]) continue;
      var x = a / units[i][0], r = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;
      if (r >= 1000 && i > 0) return { n: sign + one(a / units[i - 1][0]), u: units[i - 1][1] };
      return { n: sign + one(x), u: units[i][1] };
    }
    return { n: sign + String(Math.round(a)), u: "" };
  }
  function compactTxt(n) { var c = compactParts(n); return c ? c.n + c.u : ""; }
  // "7,80%" → "7,80 %" ; "79.7" → "79,7 %"
  function pct(v) {
    var s = String(v == null ? "" : v).trim();
    if (!s) return "";
    var n = num(s.replace("%", ""));
    if (!isFinite(n)) return s;
    if (EN) { var r = s.replace("%", "").trim().replace(",", "."); return (/^[\d.]+$/.test(r) ? r : frNum(n)) + "%"; }
    var raw = s.replace("%", "").trim().replace(".", ",");
    return (/^[\d,]+$/.test(raw) ? raw : frNum(n)) + " %";
  }
  function titleCase(n) {
    var s = String(n || "").trim();
    if (s !== s.toUpperCase()) return s;
    return s.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); });
  }
  function displayName(n) { return titleCase(NAME_OVERRIDES[String(n || "").trim().toLowerCase()] || n); }
  function firstName(n) { return String(n || "").trim().split(/\s+/)[0] || ""; }
  function monthFR() {
    try { var s = new Date().toLocaleDateString(I.locale, { month: "long", year: "numeric" }); return s.charAt(0).toUpperCase() + s.slice(1); } catch (e) { return ""; }
  }
  function profileUrl(handle, platform) {
    var h = String(handle || "").replace(/^@/, "").trim(), p = String(platform || "").toLowerCase();
    if (p.indexOf("tiktok") >= 0) return "https://www.tiktok.com/@" + h;
    if (p.indexOf("youtube") >= 0) return "https://youtube.com/@" + h;
    if (p.indexOf("snap") >= 0) return "https://www.snapchat.com/add/" + h;
    if (p === "x" || p.indexOf("twitter") >= 0) return "https://x.com/" + h;
    return "https://instagram.com/" + h;
  }
  function telHref(phone) {
    var p = String(phone || "").replace(/[^\d+]/g, "");
    if (p.charAt(0) === "0") p = "+33" + p.slice(1);
    return "tel:" + p;
  }
  // « 07 66 25 98 03 » → « +33 7 66 25 98 03 » pour les marques étrangères.
  function intlPhone(p) { var s = String(p || "").trim(); return /^0\d/.test(s) ? "+33 " + s.slice(1) : s; }
  function bg(url) { return url ? ' style="background-image:url(&quot;' + esc(url) + '&quot;)"' : ""; }
  // Nom en deux temps (comme les kits créateurs) : 1re ligne droite, la suite en italique.
  function splitName(name) {
    var parts = String(name || "").trim().split(/\s+/);
    return esc(parts[0] || "") + (parts.length > 1 ? "<i>" + esc(parts.slice(1).join(" ")) + "</i>" : "");
  }
  // « 02 » → « 2 » : les chiffres sont composés comme dans un article, pas comme des numéros.
  function figNum(v) { var s = String(v).trim(); return /^0\d+$/.test(s) ? String(parseInt(s, 10)) : s; }
  function listFR(xs) { return I.list(xs); }

  // ── Données ────────────────────────────────────────────────────────────────
  // Plus petit prix numérique de la grille tarifaire (sauf si masquée) → « dès ».
  function minPrice(mk) {
    if (!mk || mk.hideRates || !Array.isArray(mk.rates)) return 0;
    var best = 0;
    mk.rates.forEach(function (r) {
      var s = String((r && r.price) || "").replace(/[\s  ]/g, "");
      if (!/^[\d.,]+(€|eur)?(ht)?$/i.test(s)) return;
      var n = num(s.replace(/(€|eur)?(ht)?$/i, ""));
      if (n > 0 && (!best || n < best)) best = n;
    });
    return best;
  }
  var slugs = {}; // nom réel → slug de son media kit (baké par le build)
  function normCreator(row) {
    var mk = (row && row.mediakit) || {};
    var pfs = (arr(mk.platforms) || []).filter(function (p) { return p && p.key; });
    var ig = pfs.filter(function (p) { return p.key === "instagram"; })[0] || {};
    var tk = pfs.filter(function (p) { return p.key === "tiktok"; })[0] || {};
    var withF = pfs.filter(function (p) { return isFinite(num(p.followers)) && num(p.followers) > 0; });
    var xfoll = withF.reduce(function (a, p) { return a + num(p.followers); }, 0);
    var realName = (row && row.name) || "";
    if (row && row.slug) slugs[realName] = row.slug;
    return {
      realName: realName,
      name: displayName(realName),
      handle: String(mk.handle || (row && row.handle) || "").replace(/^@/, ""),
      niche: tv(String((row && row.niche) || "").trim()),
      platform: String((row && row.platform) || "instagram").toLowerCase(),
      photoUrl: (row && row.photo_url) || null,
      // En anglais : la bio anglaise de l'app ; sans elle, pas de bio (jamais de français).
      bio: String((EN ? (I.bioEn ? I.bioEn(mk) : mk.bioEn) : mk.bio) || "").trim(),
      igER: has(ig.er) ? ig.er : "",
      tkER: has(tk.er) ? tk.er : "",
      xfoll: xfoll,
      xplats: withF.map(function (p) { return PLAT_LABEL[p.key] || p.key; }),
      fromPrice: minPrice(mk),
      casting: (mk.casting && typeof mk.casting === "object") ? mk.casting : {},
    };
  }

  // Contenu ÉDITABLE de l'agence (app → table agency_mediakit → vue public_agency_mediakit).
  // Repli sur ces valeurs si le blob est absent ou vide.
  var AG_DEFAULTS = {
    intro: {
      title: "Talent management\nstratégique",
      lead: "TTP Creators accompagne une sélection de créateurs Sport & Lifestyle : stratégie de carrière, production de contenu et négociation, tout en interne. On construit des identités qui durent, pas des pics de vues.",
    },
    pillars: [
      { title: "Talent d'abord", text: "Un créateur n'est pas une audience : c'est une marque. On construit une identité qui dure, pas des pics de vues." },
      { title: "Studio intégré", text: "Stratégie, production, négociation : tout se passe en interne. Une seule équipe, aucune perte en ligne." },
      { title: "Résultats mesurés", text: "Pas de feeling : des KPIs clairs et un reporting précis, à chaque collaboration." },
    ],
    kpis: { universes: "2", universesLabel: "Univers · Sport & Lifestyle", platforms: "5", platformsLabel: "Plateformes couvertes" },
    contact: { instagram: "ttpcreators", phone: "07 66 25 98 03", email: "partnerships@ttpcreators.pro" },
  };
  // Version anglaise du contenu agence. Priorité : champs anglais saisis dans l'app
  // (introEn, pillarsEn, kpis.*LabelEn) → traduction d'un texte français par défaut connu
  // → ces défauts anglais. Jamais de français dans le deck anglais.
  var AG_EN = {
    intro: {
      title: "Strategic\ntalent management",
      lead: "TTP Creators represents a hand-picked roster of Sport & Lifestyle creators: career strategy, content production and negotiation, all in-house. We build identities that last, not spikes in views.",
    },
    pillars: [
      { title: "Talent first", text: "A creator isn’t an audience: they’re a brand. We build an identity that lasts, not spikes in views." },
      { title: "In-house studio", text: "Strategy, production, negotiation: everything happens in-house. One team, nothing lost along the way." },
      { title: "Measured results", text: "No guesswork: clear KPIs and precise reporting, on every collaboration." },
    ],
    universesLabel: "Worlds · Sport & Lifestyle",
    platformsLabel: "Platforms covered",
  };
  var FR2EN = {};
  function fr2en(fr, en) { FR2EN[key(fr)] = en; }
  fr2en("Talent management\nstratégique", AG_EN.intro.title);
  fr2en("Talent management stratégique", AG_EN.intro.title);
  fr2en("TTP Creators accompagne une sélection de créatrices Sport & Lifestyle : stratégie de carrière, production de contenu et négociation, tout en interne. On construit des identités qui durent — pas des pics de vues.", AG_EN.intro.lead);
  fr2en("Talent d'abord", AG_EN.pillars[0].title);
  fr2en("Une créatrice n'est pas une audience : c'est une marque. On construit une identité qui dure, pas des pics de vues.", AG_EN.pillars[0].text);
  fr2en("Studio intégré", AG_EN.pillars[1].title);
  fr2en("Résultats mesurés", AG_EN.pillars[2].title);
  fr2en("Univers · Sport & Lifestyle", AG_EN.universesLabel);
  fr2en("Plateformes couvertes", AG_EN.platformsLabel);

  // Anciens textes PAR DÉFAUT (enregistrés tels quels dans la base) → nouvelle version
  // (« créateurs », sans tiret long). Un texte modifié par l'agence n'est jamais touché.
  var LEGACY = {};
  LEGACY[key("TTP Creators accompagne une sélection de créatrices Sport & Lifestyle : stratégie de carrière, production de contenu et négociation, tout en interne. On construit des identités qui durent — pas des pics de vues.")] = AG_DEFAULTS.intro.lead;
  LEGACY[key("Une créatrice n'est pas une audience : c'est une marque. On construit une identité qui dure, pas des pics de vues.")] = AG_DEFAULTS.pillars[0].text;
  function key(s) { return String(s || "").replace(/[\s  ]+/g, " ").trim(); }
  // Défauts FR actuels → anglais (déclarés après LEGACY car ils en dépendent).
  fr2en(AG_DEFAULTS.intro.lead, AG_EN.intro.lead);
  AG_DEFAULTS.pillars.forEach(function (p, i) { fr2en(p.title, AG_EN.pillars[i].title); fr2en(p.text, AG_EN.pillars[i].text); });
  function toEn(fr, enField, enDefault) { return has(enField) ? enField : (FR2EN[key(fr)] || enDefault); }
  function upgrade(s) { return LEGACY[key(s)] || s; }
  function pick(v, dflt) { return has(v) ? v : dflt; }

  function agencyData() {
    var A = window.MK_AGENCY || {};
    var a = A.agency || {};
    var intro = a.intro || {}, kpis = a.kpis || {}, contact = a.contact || {};
    var pillars = arr(a.pillars) || arr(A.pillars) || AG_DEFAULTS.pillars;
    var introFr = { title: pick(intro.title, AG_DEFAULTS.intro.title), lead: upgrade(pick(intro.lead, AG_DEFAULTS.intro.lead)) };
    var pillarsFr = pillars.filter(function (p) { return p && (has(p.title) || has(p.text)); })
      .map(function (p) { return { title: p.title || "", text: upgrade(p.text || "") }; });
    var introEn = a.introEn || {};
    // pillarsEn = traductions saisies dans l'app, à la MÊME position que les piliers français.
    var pillarsEn = Array.isArray(a.pillarsEn) ? a.pillarsEn : [];
    var uLabel = pick(kpis.universesLabel, AG_DEFAULTS.kpis.universesLabel), pLabel = pick(kpis.platformsLabel, AG_DEFAULTS.kpis.platformsLabel);
    return {
      intro: EN ? { title: toEn(introFr.title, introEn.title, AG_EN.intro.title), lead: toEn(introFr.lead, introEn.lead, AG_EN.intro.lead) } : introFr,
      // Pilier par pilier : traduction saisie → sinon traduction connue d'un texte par défaut.
      // Un pilier sans aucune version anglaise est omis ; aucun → les 3 piliers anglais par défaut.
      pillars: !EN ? pillarsFr : (function () {
        var out = pillarsFr.map(function (p, i) {
          var e = pillarsEn[i] || {};
          return { title: has(e.title) ? e.title : (FR2EN[key(p.title)] || ""), text: has(e.text) ? e.text : (FR2EN[key(p.text)] || "") };
        }).filter(function (p) { return has(p.title) || has(p.text); });
        return out.length ? out : AG_EN.pillars;
      })(),
      kpis: {
        universes: pick(kpis.universes, AG_DEFAULTS.kpis.universes),
        universesLabel: EN ? toEn(uLabel, kpis.universesLabelEn, uLabel) : uLabel,
        platforms: pick(kpis.platforms, AG_DEFAULTS.kpis.platforms),
        platformsLabel: EN ? toEn(pLabel, kpis.platformsLabelEn, pLabel) : pLabel,
        // Vides = automatique (nombre de créateurs affichés / abonnés cumulés).
        creatorsOverride: has(kpis.creatorsOverride) ? kpis.creatorsOverride : "",
        followersOverride: has(kpis.followersOverride) ? kpis.followersOverride : "",
      },
      contact: {
        instagram: String(pick(contact.instagram, AG_DEFAULTS.contact.instagram)).replace(/^@/, ""),
        phone: pick(contact.phone, AG_DEFAULTS.contact.phone),
        email: pick(contact.email, AG_DEFAULTS.contact.email),
      },
      photo: has(a.photo) ? a.photo : "",
      concepts: (Array.isArray(a.concepts) ? a.concepts : []).filter(function (c) { return c && has(c.title); }).map(function (c) {
        if (!EN) return c;
        var hlEn = (Array.isArray(c.highlightsEn) ? c.highlightsEn : []).filter(has);
        return { title: has(c.titleEn) ? c.titleEn : c.title, by: c.by, text: has(c.textEn) ? c.textEn : c.text,
          highlights: hlEn.length ? hlEn : c.highlights, brands: c.brands, photos: c.photos };
      }),
    };
  }

  // ── 1 · Couverture ─────────────────────────────────────────────────────────
  function buildCover(ag, creators) {
    var withPh = creators.filter(function (c) { return c.photoUrl; }).slice(0, 10);
    var mosaic = "";
    if (withPh.length) {
      // 1 rangée jusqu'à 3 portraits, sinon 2 rangées (la plus longue en haut).
      var top = withPh.length <= 3 ? withPh.length : Math.ceil(withPh.length / 2);
      var rows = [withPh.slice(0, top), withPh.slice(top)].filter(function (r) { return r.length; });
      mosaic = '<div class="mosaic">' + rows.map(function (r) {
        return '<div class="r">' + r.map(function (c) {
          return '<div class="ph" role="img" aria-label="' + esc(c.name) + '"' + bg(c.photoUrl) + "></div>";
        }).join("") + "</div>";
      }).join("") + "</div>";
    }
    var names = creators.map(function (c) { return firstName(c.name); }).filter(Boolean);
    return '<section class="pg p-agcover"' + (mosaic ? "" : ' style="grid-template-columns:1fr"') + '>' +
      '<div class="txt"><p class="kicker">' + L("Media kit agence", "Agency media kit") + ' · <span class="js-month">' + monthFR() + "</span></p>" +
      '<h1 class="name">TTP<i>Creators</i></h1>' +
      '<p class="meta"><a href="https://instagram.com/' + esc(ag.contact.instagram) + '" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none">@' + esc(ag.contact.instagram) + "</a> · Talent management · " + L("Lyon et Genève", "Lyon & Geneva") + "</p>" +
      (names.length ? '<p class="line">' + L("Avec ", "Featuring ") + esc(listFR(names)) + ".</p>" : "") +
      "</div>" + mosaic + "</section>";
  }

  // ── 2 · L'agence ───────────────────────────────────────────────────────────
  function buildIntro(ag, totals) {
    var lines = String(ag.intro.title).split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var title = esc(lines[0] || "") + (lines.length > 1 ? "<i>" + lines.slice(1).map(esc).join("<br>") + "</i>" : "");
    var figs = [
      [has(ag.kpis.creatorsOverride) ? ag.kpis.creatorsOverride : (totals.creators ? String(totals.creators) : ""), L("créateurs", "creators")],
      [has(ag.kpis.followersOverride) ? ag.kpis.followersOverride : totals.followers, L("abonnés cumulés", "combined followers")],
      [ag.kpis.universes, ag.kpis.universesLabel],
      [ag.kpis.platforms, ag.kpis.platformsLabel],
    ].filter(function (f) { return has(f[0]); });
    var pillars = ag.pillars.map(function (p) {
      return '<div class="pillar">' + (has(p.title) ? "<h3>" + esc(p.title) + "</h3>" : "") + (has(p.text) ? "<p>" + esc(p.text) + "</p>" : "") + "</div>";
    }).join("");
    return '<section class="pg p-intro"' + (pillars ? "" : ' style="grid-template-columns:1fr"') + '>' +
      '<div class="l"><p class="kicker">' + L("L’agence", "The agency") + "</p><h2>" + title + "</h2>" +
      (has(ag.intro.lead) ? '<p class="lead">' + esc(ag.intro.lead) + "</p>" : "") +
      (figs.length ? '<div class="figs">' + figs.map(function (f) { return '<div><b class="tnum">' + esc(figNum(f[0])) + "</b>" + esc(f[1]) + "</div>"; }).join("") + "</div>" : "") +
      "</div>" + (pillars ? '<div class="r">' + pillars + "</div>" : "") + "</section>";
  }

  // ── 3 · Marques (en « crédits », comme les kits créateurs) ─────────────────
  function buildBrands() {
    var clients = (window.MK_AGENCY && window.MK_AGENCY.clients) || [];
    if (!clients.length) return "";
    return '<section class="pg p-brands one ag"><div class="l"><p class="kicker">' + L("Partenaires", "Partners") + "</p>" +
      "<h3>" + L("Ces marques nous ont fait confiance", "Brands that have trusted us") + "</h3>" +
      '<p class="credits' + (clients.length > 12 ? " long" : "") + '">' +
      clients.map(function (b) { return "<span>" + esc(String(b.name).trim()) + "</span>"; }).join(" ") + "</p></div></section>";
  }

  // ── 4 · Une page par créateur ──────────────────────────────────────────────
  function buildTalent(c) {
    var meta = [];
    if (has(c.handle)) meta.push('<a href="' + esc(profileUrl(c.handle, c.platform)) + '" target="_blank" rel="noreferrer">@' + esc(c.handle) + "</a>");
    if (has(c.niche)) meta.push(esc(c.niche));
    if (c.xplats.length) meta.push(esc(listFR(c.xplats)));
    var bio = c.bio ? '<div class="bio">' + c.bio.split(/\n\s*\n+/).slice(0, 3).map(function (p) { return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("") + "</div>" : "";
    var figs = [];
    if (c.xfoll > 0) figs.push([compactTxt(c.xfoll), EN ? "followers" + (c.xplats.length > 1 ? ", all platforms" : " on " + c.xplats[0])
      : "abonnés" + (c.xplats.length > 1 ? ", toutes plateformes" : " sur " + c.xplats[0])]);
    if (has(c.igER)) figs.push([pct(c.igER), L("d'engagement sur Instagram", "engagement on Instagram")]);
    if (has(c.tkER)) figs.push([pct(c.tkER), L("d'engagement sur TikTok", "engagement on TikTok")]);
    if (c.fromPrice > 0) figs.push([EN ? "from €" + frNum(c.fromPrice, 2) : "dès " + frNum(c.fromPrice, 2) + " €", L("HT, par contenu", "excl. VAT, per piece of content")]);
    var slug = slugs[c.realName];
    return '<section class="pg p-talent">' +
      '<div class="ph" role="img" aria-label="' + esc(c.name) + '"' + bg(c.photoUrl) + "></div>" +
      '<div class="txt"><p class="kicker">' + L("Le roster", "The roster") + "</p>" +
      '<h2 class="name">' + splitName(c.name) + "</h2>" +
      (meta.length ? '<p class="meta">' + meta.join(" · ") + "</p>" : "") + bio +
      (figs.length ? '<div class="figs">' + figs.map(function (f) { return '<div><b class="tnum">' + esc(f[0]) + "</b>" + esc(f[1]) + "</div>"; }).join("") + "</div>" : "") +
      (slug ? '<p class="more"><a href="https://ttpcreators.pro/mediakit/' + esc(slug) + (EN ? "/en/" : "/") + '" target="_blank" rel="noreferrer">' + L("Voir son media kit complet", "View full media kit") + "</a></p>" : "") +
      "</div></section>";
  }

  // ── 5 · Casting : qui fait quoi ────────────────────────────────────────────
  // MÊME liste (clés + ordre) que CASTING_CRITERIA dans l'app (MediakitEditor.tsx).
  var CASTING = EN
    ? [["sport", "Sport"], ["mode", "Fashion"], ["beaute", "Beauty / skincare"], ["food", "Food"],
      ["wellness", "Wellness"], ["voyage", "Travel"], ["deco", "Home / decor"], ["famille", "Family"],
      ["animaux", "Pets"], ["pedago", "Educational content"]]
    : [["sport", "Sport"], ["mode", "Mode"], ["beaute", "Beauté / skincare"], ["food", "Food"],
      ["wellness", "Bien-être"], ["voyage", "Voyage"], ["deco", "Déco / maison"], ["famille", "Famille"],
      ["animaux", "Animaux"], ["pedago", "Contenu pédagogique"]];
  var CASTING_PER_PAGE = 6;
  var CHECK = '<svg class="yes" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="' + L("Oui", "Yes") + '"><path d="M4 12.5l5 5L20 6.5"/></svg>';
  function buildCasting(creators) {
    var list = creators.filter(function (c) { return CASTING.some(function (k) { return has(c.casting[k[0]]); }); });
    if (!list.length) return "";
    var rows = CASTING.filter(function (k) { return list.some(function (c) { return has(c.casting[k[0]]); }); });
    // Répartition équilibrée (ex. 9 → 5 + 4, jamais 6 + 1).
    var per = Math.ceil(list.length / Math.ceil(list.length / CASTING_PER_PAGE));
    var chunks = [];
    for (var i = 0; i < list.length; i += per) chunks.push(list.slice(i, i + per));
    return chunks.map(function (chunk, ci) {
      var head = '<tr><th scope="col"></th>' + chunk.map(function (c) {
        return '<th scope="col"><span class="who"><span class="ph"' + bg(c.photoUrl) + "></span><b>" + esc(firstName(c.name)) + "</b></span></th>";
      }).join("") + "</tr>";
      var body = rows.map(function (k) {
        return '<tr><th scope="row">' + esc(k[1]) + "</th>" + chunk.map(function (c) {
          var v = String(c.casting[k[0]] || "").trim();
          var cell = !v ? "" : /^(oui|x|✓|yes)$/i.test(v) ? CHECK : '<span class="txt">' + esc(tv(v)) + "</span>";
          return "<td>" + cell + "</td>";
        }).join("") + "</tr>";
      }).join("");
      var part = chunks.length > 1 ? " · " + (ci + 1) + L(" sur ", " of ") + chunks.length : "";
      return '<section class="pg p-casting"><header><h3>' + L("Qui fait <i>quoi</i>", "Who does <i>what</i>") + "</h3>" +
        '<p class="kicker">' + L("Univers de contenu, par créateur", "Content worlds, by creator") + part + "</p></header>" +
        '<div class="wrap"><table class="ctable"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div></section>";
    }).join("");
  }

  // ── 6 · Événements et concepts (une page chacun) ───────────────────────────
  function buildConcept(c) {
    var photos = (Array.isArray(c.photos) ? c.photos : []).filter(has).slice(0, 4);
    var hl = (Array.isArray(c.highlights) ? c.highlights : []).filter(has);
    var paras = has(c.text) ? String(c.text).split(/\n\s*\n+/).map(function (p) { return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("") : "";
    var h = has(c.by) ? String(c.by).replace(/^@/, "").trim() : "";
    var txt = '<div class="txt"><p class="kicker">' + L("Événements et concepts", "Events & concepts") + "</p>" +
      "<h2>" + esc(c.title) + "</h2>" +
      (h ? '<a class="by" href="https://instagram.com/' + esc(h) + '" target="_blank" rel="noreferrer">' + L("Porté par @", "Led by @") + esc(h) + "</a>" : "") +
      (paras ? '<div class="body">' + paras + "</div>" : "") +
      (hl.length ? "<ul>" + hl.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      (has(c.brands) ? '<p class="with">' + L("Déjà accompagné par ", "Already backed by ") + esc(c.brands) + "</p>" : "") + "</div>";
    var media = photos.length
      ? '<div class="photos n' + photos.length + '">' + photos.map(function (u) { return '<div class="ph" role="img" aria-label="' + esc(c.title) + '"' + bg(u) + "></div>"; }).join("") + "</div>"
      : "";
    return '<section class="pg p-concept' + (media ? "" : " no-media") + '">' + txt + media + "</section>";
  }

  // ── 7 · Contact ────────────────────────────────────────────────────────────
  function buildContact(ag) {
    var ig = ag.contact.instagram, phone = ag.contact.phone, email = ag.contact.email;
    var ways = "";
    if (has(email)) ways += '<div><span>' + L("E-mail", "Email") + '</span><a href="mailto:' + esc(email) + '">' + esc(email) + "</a></div>";
    if (has(phone)) ways += '<div><span>' + L("Téléphone", "Phone") + '</span><a class="tnum" href="' + esc(telHref(phone)) + '">' + esc(EN ? intlPhone(phone) : phone) + "</a></div>";
    if (has(ig)) ways += '<div><span>Instagram</span><a href="https://instagram.com/' + esc(ig) + '" target="_blank" rel="noreferrer">@' + esc(ig) + "</a></div>";
    return '<section class="pg p-contact' + (ag.photo ? "" : " one") + '"><div class="txt"><p class="kicker">Contact</p>' +
      "<h2>" + L("Travaillons<i>ensemble</i>", "Let’s work<i>together</i>") + "</h2>" +
      '<div class="ways">' + ways + "</div>" +
      '<div class="foot"><span>TTP Creators · Talent management · ' + L("Lyon et Genève", "Lyon & Geneva") + "</span><span>" + L("Media kit agence", "Agency media kit") + ' · <span class="js-month">' + monthFR() + "</span></span></div></div>" +
      (ag.photo ? '<div class="ph" role="img" aria-label="TTP Creators"' + bg(ag.photo) + "></div>" : "") + "</section>";
  }

  function build() {
    var raw = (window.MK_AGENCY && window.MK_AGENCY.creators) || [];
    var all = raw.map(normCreator);
    // Filtre qualité : une page n'est montrée aux marques que si le créateur a au moins
    // une bio OU un chiffre. Les fiches vides apparaissent dès qu'elles sont complétées dans l'app.
    var ok = function (c) { return has(c.bio) || has(c.igER) || has(c.tkER) || c.xfoll > 0; };
    var shown = all.filter(ok);
    var skipped = all.filter(function (c) { return !ok(c); });
    if (skipped.length && window.console) {
      console.info("[media-kit-agence] Fiches masquées (données incomplètes dans l'app) : " + skipped.map(function (c) { return c.name; }).join(", "));
    }
    var xtot = shown.reduce(function (a, c) { return a + c.xfoll; }, 0);
    var ag = agencyData();
    if (OG) return buildOg(ag, shown, xtot > 0 ? compactTxt(xtot) : "");
    return buildCover(ag, shown) + buildIntro(ag, { creators: shown.length, followers: xtot > 0 ? compactTxt(xtot) : "" }) + buildBrands() +
      shown.map(buildTalent).join("") + buildCasting(shown) + ag.concepts.map(buildConcept).join("") + buildContact(ag);
  }

  // ── Aperçu de partage (?og=1) : la couverture du deck resserrée en carte 1200×630 ──
  function buildOg(ag, creators, followers) {
    var withPh = creators.filter(function (c) { return c.photoUrl; }).slice(0, 8);
    var top = withPh.length <= 4 ? withPh.length : Math.ceil(withPh.length / 2);
    var rows = [withPh.slice(0, top), withPh.slice(top)].filter(function (r) { return r.length; });
    var mosaic = rows.length ? '<div class="mosaic">' + rows.map(function (r) {
      return '<div class="r">' + r.map(function (c) { return '<div class="ph"' + bg(c.photoUrl) + "></div>"; }).join("") + "</div>";
    }).join("") + "</div>" : "";
    var figs = [
      [has(ag.kpis.creatorsOverride) ? ag.kpis.creatorsOverride : (creators.length ? String(creators.length) : ""), L("créateurs", "creators")],
      [has(ag.kpis.followersOverride) ? ag.kpis.followersOverride : followers, L("abonnés cumulés", "combined followers")],
      [ag.kpis.platforms, ag.kpis.platformsLabel],
    ].filter(function (f) { return has(f[0]); });
    return '<section class="og-card og-agence"' + (mosaic ? "" : ' style="grid-template-columns:1fr"') + ">" +
      '<div class="txt"><p class="kicker">' + L("Media kit agence", "Agency media kit") + " · " + monthFR() + "</p>" +
      '<h1 class="name">TTP<i>Creators</i></h1>' +
      '<p class="meta">Talent management · ' + L("Lyon et Genève", "Lyon & Geneva") + "</p>" +
      (figs.length ? '<div class="figs">' + figs.map(function (f) { return '<div><b class="tnum">' + esc(figNum(f[0])) + "</b>" + esc(f[1]) + "</div>"; }).join("") + "</div>" : "") +
      "</div>" + mosaic + "</section>";
  }
  function fitOgName() {
    var n = kit.querySelector(".og-card .name");
    if (!n) return;
    var size = 132;
    n.style.fontSize = size + "px";
    while (size > 56 && n.scrollWidth > n.clientWidth + 1) { size -= 4; n.style.fontSize = size + "px"; }
  }

  var kit = document.getElementById("kit"), bar = document.getElementById("progress");
  function paint() {
    kit.innerHTML = build();
    if (OG) {
      fitOgName();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitOgName);
    }
  }
  function onScroll() {
    var h = d.scrollHeight - d.clientHeight, top = d.scrollTop || document.body.scrollTop || 0;
    if (bar) bar.style.width = (h > 0 ? (top / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // 1) Rendu immédiat depuis la donnée bakée (PDF déterministe en CI).
  if (!window.MK_AGENCY) window.MK_AGENCY = { creators: [], clients: [], pillars: [], agency: {} };
  applyTheme((window.MK_AGENCY.agency || {}).theme);
  paint();
  onScroll();

  // 1b) Bouton PDF : lien direct vers le PDF pré-rendu ; s'il manque, impression navigateur.
  (function () {
    var btn = document.getElementById("dl-pdf");
    if (!btn) return;
    var href = btn.getAttribute("href");
    try {
      fetch(href, { method: "HEAD" }).then(function (r) { if (!r.ok) throw 0; }).catch(function () {
        btn.removeAttribute("href");
        btn.removeAttribute("download");
        btn.setAttribute("role", "button");
        btn.style.cursor = "pointer";
        btn.addEventListener("click", function () { window.print(); });
      });
    } catch (e) {}
  })();

  // 2) Contenu à jour (page web) : créateurs actifs + contenu agence édité dans l'app.
  // (Pas pour l'aperçu de partage : il reste identique à la donnée bakée du build.)
  var H = { headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY } };
  if (!OG) try {
    fetch(SB_URL + "/rest/v1/public_mediakit?select=name,handle,niche,platform,photo_url,mediakit,sort_order&order=sort_order", H)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) { if (rows && rows.length) { window.MK_AGENCY.creators = rows; paint(); onScroll(); } })
      .catch(function () {});
  } catch (e) {}
  if (!OG) try {
    fetch(SB_URL + "/rest/v1/public_agency_mediakit?select=data&limit=1", H)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (rows && rows[0] && rows[0].data) {
          window.MK_AGENCY.agency = rows[0].data;
          applyTheme(rows[0].data.theme);
          paint();
          onScroll();
        }
      })
      .catch(function () {});
  } catch (e) {}
})();
