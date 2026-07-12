/* ============================================================================
 * Media kit — moteur de rendu GÉNÉRIQUE (une page par créatrice).
 * Le shell (mediakit/<slug>/index.html) bake window.MK = {name, handle,
 * platform, photo_url} pour un rendu immédiat, puis on lit public_mediakit
 * (Supabase, anon) par NOM pour récupérer le contenu à jour. Les sections sans
 * données sont masquées ; la photo du roster sert de repli.
 * ========================================================================== */
(function () {
  "use strict";
  var SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co";
  var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3ppZ2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30.5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU";

  var d = document.documentElement;
  d.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PLAT_LABEL = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", snapchat: "Snapchat", x: "X" };
  var PLAT_INTRO = {
    instagram: "Une création de contenu à la fois authentique et esthétique, pensée pour tisser un lien durable avec une communauté engagée et fidèle.",
    tiktok: "Des formats courts et spontanés, portés par un fort taux d'engagement et une audience en pleine croissance.",
    youtube: "Un format long qui installe une relation de confiance durable avec une audience fidèle et attentive.",
    snapchat: "Une proximité au quotidien : des contenus spontanés et un lien direct avec une communauté très engagée.",
    x: "Une prise de parole réactive et une communauté engagée sur les sujets du moment.",
  };
  var PLAT_LAYOUT = {
    instagram: {
      tris: [["Comptes touchés — 30 jours", "impressions30j"], ["Tranche d'âge principale", "ageBracket"], ["Non-followers", "nonFollowersPct"]],
      rows: [["Followers", "followers"], ["Taux d'engagement", "er"], ["Meilleur format — Réels", "bestFormatPct"]],
    },
    tiktok: {
      tris: [["Taux d'engagement TikTok", "er"], ["Tranche d'âge principale", "ageBracket"], ["Nouveaux spectateurs — 30 jours", "newViewers30j"]],
      rows: [["Followers", "followers"], ["J'aime cumulés", "likesTotal"], ["Vues — 30 derniers jours", "views30j"]],
    },
    youtube: {
      tris: [["Vues — 30 jours", "views30j"], ["Tranche d'âge principale", "ageBracket"], ["Abonnés gagnés — 30 jours", "newViewers30j"]],
      rows: [["Abonnés", "followers"], ["Taux d'engagement", "er"], ["Heures de visionnage", "watchHours"]],
    },
    snapchat: {
      tris: [["Vues de story — 30 jours", "views30j"], ["Tranche d'âge principale", "ageBracket"], ["Abonnés gagnés — 30 jours", "newViewers30j"]],
      rows: [["Abonnés", "followers"], ["Taux d'engagement", "er"], ["Portée", "reach"]],
    },
    x: {
      tris: [["Impressions — 30 jours", "impressions30j"], ["Tranche d'âge principale", "ageBracket"], ["Taux d'engagement", "er"]],
      rows: [["Followers", "followers"], ["Taux d'engagement", "er"], ["Impressions — 30 jours", "impressions30j"]],
    },
  };
  var DONUT_COLORS = ["#3d0000", "#e6d9d9", "#1a1a1a", "#8a2b3a", "#c98b96", "#5a1119"];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(/\s/g, "").replace(",", ".")); return isFinite(n) ? n : 0; }
  function has(v) { return v != null && String(v).trim() !== ""; }
  function val(v) { return has(v) ? esc(v) : "—"; }
  function arr(a) { return Array.isArray(a) && a.length ? a : null; }
  function firstName(name) { return String(name || "").trim().split(/\s+/)[0] || ""; }
  function zero(n) { return (n < 10 ? "0" : "") + n; }
  function monthFR() { try { return new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); } catch (e) { return ""; } }
  function profileUrl(handle, platform) {
    var h = String(handle || "").replace(/^@/, "").trim();
    var p = String(platform || "").toLowerCase();
    if (p.indexOf("tiktok") >= 0) return "https://www.tiktok.com/@" + h;
    if (p.indexOf("youtube") >= 0) return "https://youtube.com/@" + h;
    if (p.indexOf("snap") >= 0) return "https://www.snapchat.com/add/" + h;
    if (p === "x" || p.indexOf("twitter") >= 0) return "https://x.com/" + h;
    return "https://instagram.com/" + h;
  }

  // Normalise une ligne public_mediakit (ou window.MK) en objet d'affichage.
  function normalize(row) {
    var mk = (row && row.mediakit) || {};
    var au = mk.audience || {};
    return {
      name: (row && row.name) || "",
      handle: String(mk.handle || (row && row.handle) || "").replace(/^@/, ""),
      platform: (row && row.platform) || "instagram",
      photoUrl: (row && row.photo_url) || null,
      bio: mk.bio || "",
      tags: arr(mk.tags) || [],
      audience: { age: arr(au.age) || [], gender: au.gender || {}, pays: arr(au.pays) || [], formats: arr(au.formats) || [] },
      platforms: arr(mk.platforms) || [],
      brands: arr(mk.brands) || [],
      photos: mk.photos || {},
    };
  }

  function photoBox(url, note, badge) {
    var inner = url
      ? '<img src="' + esc(url) + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">'
      : '<span class="photo-note">' + note + "</span>";
    return '<div class="photo">' + inner + (badge ? '<span class="photo-badge">TTP — Creators</span>' : "") + "</div>";
  }
  function barsHTML(rows, keyName) {
    return rows.map(function (r) {
      var label = keyName ? r[keyName] : r.label, p = num(r.pct);
      return '<div class="bar-row"><span class="bar-name">' + esc(label) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + p + '%"></span></span>' +
        '<span class="bar-val tnum">' + p + "%</span></div>";
    }).join("");
  }
  function donutHTML(formats) {
    var C = 502.65, off = 0, circles = '<circle cx="100" cy="100" r="80" fill="none" stroke="var(--track)" stroke-width="30"></circle>';
    formats.forEach(function (f, i) {
      var seg = (num(f.pct) / 100) * C;
      circles += '<circle cx="100" cy="100" r="80" fill="none" stroke="' + DONUT_COLORS[i % DONUT_COLORS.length] +
        '" stroke-width="30" stroke-dasharray="' + seg.toFixed(1) + " " + C + '" stroke-dashoffset="' + (-off).toFixed(1) +
        '" transform="rotate(-90 100 100)"></circle>';
      off += seg;
    });
    var legend = formats.map(function (f, i) {
      return '<span class="legend-item"><span class="swatch" style="background:' + DONUT_COLORS[i % DONUT_COLORS.length] + '"></span>' + esc(f.label) + " " + num(f.pct) + "%</span>";
    }).join("");
    return '<svg class="donut" viewBox="0 0 200 200" role="img" aria-label="Répartition des formats">' + circles + "</svg><div class=\"legend\">" + legend + "</div>";
  }

  function buildHero(data) {
    var parts = String(data.name).trim().split(/\s+/), first = parts[0] || "", rest = parts.slice(1).join(" ");
    var bioP = has(data.bio) ? '<div class="hero-bio">' + String(data.bio).split(/\n\n+/).map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("") + "</div>" : "";
    var tags = data.tags.length ? '<div class="tags">' + data.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" : "";
    var handle = has(data.handle) ? '<a class="hero-handle" href="' + esc(profileUrl(data.handle, data.platform)) + '" target="_blank" rel="noreferrer">@' + esc(data.handle) + "</a>" : "";
    return '<section class="hero"><div class="hero-text" data-reveal>' +
      '<p class="eyebrow">Media Kit — <span class="js-month">' + monthFR() + "</span></p>" +
      '<h1 class="display hero-name">' + esc(first) + (rest ? "<br>" + esc(rest) : "") + "</h1>" +
      handle + bioP + tags + "</div>" +
      '<div class="hero-media">' + photoBox(data.photos.hero || data.photoUrl, "Portrait principal<br>— à venir —", true) + "</div></section>";
  }

  function mainPlatform(data) {
    return data.platforms.filter(function (p) { return (p.key || "") === data.platform; })[0] || data.platforms[0] || {};
  }

  function buildAudience(data) {
    var a = data.audience;
    // Genre : si un seul des deux est renseigné, on déduit l'autre (100 − x)
    // pour ne jamais afficher un disgracieux « Hommes 0% ».
    var gf = a.gender.femmes, gh = a.gender.hommes;
    if (has(gf) && !has(gh)) gh = String(Math.max(0, 100 - num(gf)));
    else if (has(gh) && !has(gf)) gf = String(Math.max(0, 100 - num(gh)));
    var hasGender = has(gf) || has(gh);
    if (!(a.age.length || a.formats.length || a.pays.length || hasGender)) return "";
    var main = mainPlatform(data);
    var communaute = barsHTML(a.age, null) +
      (hasGender ? barsHTML([{ label: "Femmes", pct: gf }, { label: "Hommes", pct: gh }], null) : "");
    var bestFmt = a.formats[0] || null;
    var mid = (bestFmt ? '<div><div class="big-stat tnum">' + num(bestFmt.pct) + '%</div><div class="stat-cap">Meilleur format — ' + esc(bestFmt.label) + "</div></div>" : "") +
      (a.formats.length ? donutHTML(a.formats) : "");
    var right = [
      [main.er, "Taux d'engagement " + (PLAT_LABEL[main.key] || "")],
      [main.impressions30j, "Impressions sur les 30 derniers jours"],
      [main.nonFollowersPct, "Non-followers touchés"],
    ].filter(function (r) { return has(r[0]); }).map(function (r) {
      return '<div class="rstat"><div class="big-stat tnum">' + esc(r[0]) + '</div><div class="stat-cap">' + esc(r[1]) + "</div></div>";
    }).join("");
    var srcLabel = PLAT_LABEL[main.key] || "Instagram";
    return '<section class="sheet audience"><div class="sec-head" data-reveal>' +
      '<p class="eyebrow">( 02 ) — Communauté</p><div class="sec-titlerow">' +
      '<h2 class="display sec-title">Audience</h2><hr class="rule"><span class="sec-tag">' + esc(firstName(data.name)) + " — KPI's</span></div></div>" +
      '<div class="aud-grid" data-reveal>' +
      '<div class="aud-col">' + (a.age.length || hasGender ? '<div><p class="col-label">Communauté</p><div class="bars">' + communaute + "</div></div>" : "") +
      (a.pays.length ? '<div><p class="col-label">Localisation</p><div class="bars">' + barsHTML(a.pays, "name") + "</div></div>" : "") + "</div>" +
      '<div class="aud-col mid">' + mid + "</div>" +
      '<div class="aud-col">' + right + "</div></div>" +
      '<p class="aud-foot">Source — Analytics ' + esc(srcLabel) + ' · 30 derniers jours · <span class="js-month">' + monthFR() + "</span></p></section>";
  }

  function buildPlatforms(data) {
    var pls = data.platforms, n = pls.length;
    if (!n) return "";
    return pls.map(function (p, i) {
      var lay = PLAT_LAYOUT[p.key] || PLAT_LAYOUT.instagram;
      var head = i === 0
        ? '<div class="sec-head" data-reveal><p class="eyebrow">( 03 ) — Par plateforme</p><div class="sec-titlerow"><h2 class="display sec-title">Les chiffres</h2><hr class="rule"></div></div>'
        : "";
      var tris = lay.tris.map(function (t) { return '<div class="tri"><div class="tri-num tnum">' + val(p[t[1]]) + '</div><div class="tri-cap">' + esc(t[0]) + "</div></div>"; }).join("");
      var rows = lay.rows.map(function (r) { return '<div class="plat-row"><span class="plat-row-label">' + esc(r[0]) + '</span><span class="plat-row-val tnum">' + val(p[r[1]]) + "</span></div>"; }).join("");
      var shot = data.photos[p.key];
      var phone = shot
        ? '<div class="phone"><div class="phone-screen"><img src="' + esc(shot) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:30px"></div></div>'
        : '<div class="phone"><div class="phone-screen"><span>Capture profil<br>' + esc(PLAT_LABEL[p.key] || p.key) + "</span></div></div>";
      return '<section class="sheet platform">' + head +
        '<div class="plat-grid" data-reveal><div>' +
        '<p class="plat-kicker">Plateforme ' + zero(i + 1) + " / " + zero(n) + "</p>" +
        '<div class="plat-name">' + esc(PLAT_LABEL[p.key] || p.key) + "</div>" +
        '<p class="plat-intro">' + esc(PLAT_INTRO[p.key] || "") + "</p>" +
        '<div class="plat-tris">' + tris + '</div><div class="plat-rows">' + rows + "</div></div>" +
        '<div class="plat-media phone-wrap">' + phone + "</div></div></section>";
    }).join("");
  }

  function buildBrands(data) {
    var brands = data.brands;
    if (!brands.length) return "";
    var cells = brands.map(function (b) {
      var inner = b.logo ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" style="max-height:60%;max-width:75%;object-fit:contain">' : "<span>" + esc(b.name) + "</span>";
      return '<div class="logo-cell">' + inner + "</div>";
    }).join("");
    return '<section class="sheet brands"><div class="sec-head" data-reveal>' +
      '<p class="eyebrow">( 04 ) — Preuves sociales</p><div class="sec-titlerow">' +
      '<h2 class="display sec-title">Ces marques ont<br>fait confiance à ' + esc(firstName(data.name)) + "</h2>" +
      '<hr class="rule"><span class="sec-tag">' + brands.length + " Collaboration" + (brands.length > 1 ? "s" : "") + "</span></div></div>" +
      '<div class="logo-grid" data-reveal>' + cells + "</div></section>";
  }

  function buildContact(data) {
    return '<section class="contact"><div class="contact-text" data-reveal>' +
      '<p class="eyebrow">( 05 ) — Contact</p><h2 class="display contact-title">Let\'s<br>Work !</h2>' +
      '<div class="contact-block"><span class="k">Social Media</span><a class="v contact-link" href="https://instagram.com/ttpcreators" target="_blank" rel="noreferrer">@ttpcreators</a></div>' +
      '<div class="contact-block"><span class="k">Mobile</span><a class="v contact-link tnum" href="tel:+33766259803">07 66 25 98 03</a></div>' +
      '<div class="contact-block"><span class="k">Email</span><a class="v contact-link" href="mailto:partnerships@ttpcreators.pro">partnerships@ttpcreators.pro</a></div></div>' +
      '<div class="contact-media hero-media">' + photoBox(data.photos.contact || data.photoUrl, "Portrait secondaire<br>— à venir —", false) + "</div>" +
      '<div class="footer"><div>TTP Creators — Talent management stratégique</div>' +
      '<div>Media Kit · ' + esc(data.name) + ' · <span class="js-month">' + monthFR() + "</span></div></div></section>";
  }

  function build(data) {
    return buildHero(data) + buildAudience(data) + buildPlatforms(data) + buildBrands(data) + buildContact(data);
  }

  var kit = document.getElementById("kit"), bar = document.getElementById("progress"), _io = null;
  function wireReveals(animate) {
    var els = kit.querySelectorAll("[data-reveal]");
    if (_io) { _io.disconnect(); _io = null; }
    if (!animate || reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    _io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); _io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { _io.observe(e); });
  }
  function paint(data, animate) {
    kit.innerHTML = build(data);
    if (data.name) document.title = "Media Kit — " + data.name + " · TTP Creators";
    wireReveals(animate);
  }
  function onScroll() {
    var h = d.scrollHeight - d.clientHeight, top = d.scrollTop || document.body.scrollTop || 0;
    if (bar) bar.style.width = (h > 0 ? (top / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // 1) Rendu immédiat depuis les champs bakés (nom, handle, photo) → hero visible tout de suite.
  var baked = window.MK || {};
  paint(normalize({ name: baked.name, handle: baked.handle, platform: baked.platform, photo_url: baked.photo_url, mediakit: null }), true);
  onScroll();

  // 2) Contenu à jour : on lit la ligne par NOM (toujours présent).
  var name = baked.name || "";
  if (name) {
    try {
      fetch(SB_URL + "/rest/v1/public_mediakit?select=name,handle,platform,photo_url,mediakit&name=eq." + encodeURIComponent(name), {
        headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rows) { if (rows && rows.length) { paint(normalize(rows[0]), false); onScroll(); } })
        .catch(function () {});
    } catch (e) {}
  }
})();
