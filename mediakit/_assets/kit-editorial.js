/* ============================================================================
 * Media kit créateur — moteur de rendu, direction « Éditorial » (2026-10-05).
 * Le shell (mediakit/<slug>/index.html) bake window.MK (donnée COMPLÈTE) → rendu
 * immédiat et PDF déterministe ; puis lecture de public_mediakit (anon) pour
 * rafraîchir la page web. Une section = une page 16:9 (voir kit-editorial.css).
 * Règle : aucune case vide ni « — » : une donnée absente = la ligne disparaît.
 * ========================================================================== */
(function () {
  "use strict";
  var SB_URL = "https://zizvggziggswhrbuyhuo.supabase.co";
  var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenZnZ3ppZ2dzd2hyYnV5aHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk2NjcsImV4cCI6MjA5ODUxNTY2N30.5nB-lhwwasTyKKYAyO0m79gcu6xAg5b0oH2uobUcvQU";
  var d = document.documentElement;

  // Thème choisi dans l'app (mediakit.theme) ; ?theme=<nom> = aperçu.
  var THEMES = ["blanc", "bordeaux", "sauge", "ivoire", "minuit"];
  var themePreview = (function () { try { return new URLSearchParams(location.search).get("theme"); } catch (e) { return null; } })();
  function applyTheme(t) {
    var v = themePreview || t;
    if (THEMES.indexOf(v) >= 0 && v !== "blanc") d.setAttribute("data-mk-theme", v);
    else d.removeAttribute("data-mk-theme");
  }

  var PLAT_LABEL = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", snapchat: "Snapchat", x: "X" };
  // Lignes affichées sous le grand chiffre (abonnés), dans cet ordre, seulement si remplies.
  var PLAT_ROWS = {
    instagram: [["Impressions, 30 jours", "impressions30j"], ["Taux d'engagement", "er"], ["Non-abonnés touchés", "nonFollowersPct"], ["Tranche d'âge principale", "ageBracket"], ["Vues moyennes par réel", "avgViews"], ["Vues moyennes par story", "avgStoryViews"], ["Meilleur format", "bestFormatPct"]],
    tiktok: [["Vues, 30 jours", "views30j"], ["Taux d'engagement", "er"], ["Nouveaux spectateurs, 30 jours", "newViewers30j"], ["J'aime cumulés", "likesTotal"], ["Tranche d'âge principale", "ageBracket"], ["Vues moyennes par vidéo", "avgViews"], ["J'aime moyens par vidéo", "avgLikes"]],
    youtube: [["Vues, 30 jours", "views30j"], ["Taux d'engagement", "er"], ["Abonnés gagnés, 30 jours", "newViewers30j"], ["Heures de visionnage", "watchHours"], ["Tranche d'âge principale", "ageBracket"], ["Vues moyennes par vidéo", "avgViews"]],
    snapchat: [["Vues de story, 30 jours", "views30j"], ["Taux d'engagement", "er"], ["Abonnés gagnés, 30 jours", "newViewers30j"], ["Portée", "reach"], ["Tranche d'âge principale", "ageBracket"]],
    x: [["Impressions, 30 jours", "impressions30j"], ["Taux d'engagement", "er"], ["Tranche d'âge principale", "ageBracket"]],
  };
  var PLAT_INTRO = {
    instagram: "Une création à la fois authentique et soignée, pensée pour tisser un lien durable avec une communauté fidèle.",
    tiktok: "Des formats courts et spontanés, portés par une audience engagée et en pleine croissance.",
    youtube: "Un format long qui installe une relation de confiance avec une audience attentive.",
    snapchat: "Une proximité au quotidien, avec un lien direct et très engagé.",
    x: "Une prise de parole réactive sur les sujets du moment.",
  };
  var RATES_NOTE = "Tarifs indicatifs hors taxes. Des packs sur mesure sont proposés selon le dispositif.";
  var NAME_OVERRIDES = { "lucie botans": "LUCIE BOTS" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function has(v) { return v != null && String(v).trim() !== ""; }
  function arr(a) { return Array.isArray(a) && a.length ? a : null; }
  function num(v) {
    var s = String(v == null ? "" : v).trim().toLowerCase().replace(/[\s  ]/g, "").replace(",", ".");
    var m = /^(-?[\d.]+)(k|m)?/.exec(s);
    if (!m) return NaN;
    var n = parseFloat(m[1]);
    if (m[2] === "k") n *= 1e3;
    if (m[2] === "m") n *= 1e6;
    return n;
  }
  function frNum(n, digits) {
    try { return n.toLocaleString("fr-FR", { maximumFractionDigits: digits == null ? 1 : digits }); } catch (e) { return String(n); }
  }
  // Grands nombres (format voulu par Marc) : 1 300 → « 1,3K », 45 800 → « 45,8K », 919 000 → « 919K »,
  // 1 000 000 → « 1M », 2,4 milliards → « 2,4Md ». Une décimale sous 100, unité collée.
  function compactParts(n) {
    if (!isFinite(n)) return null;
    var a = Math.abs(n), sign = n < 0 ? "-" : "", units = [[1e9, "Md"], [1e6, "M"], [1e3, "K"]];
    function one(x) { return String(x >= 100 ? Math.round(x) : Math.round(x * 10) / 10).replace(".", ","); }
    for (var i = 0; i < units.length; i++) {
      if (a < units[i][0] && Math.round(a) < units[i][0]) continue;
      var x = a / units[i][0], r = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;
      if (r >= 1000 && i > 0) return { n: sign + one(a / units[i - 1][0]), u: units[i - 1][1] };
      return { n: sign + one(x), u: units[i][1] };
    }
    return { n: sign + String(Math.round(a)), u: "" };
  }
  function compact(v) { return compactParts(num(v)); }
  function compactTxt(v) { var c = compact(v); return c ? c.n + c.u : ""; }
  // "7,80%" → "7,80 %" ; "79.7" → "79,7 %"
  function pct(v) {
    var s = String(v == null ? "" : v).trim();
    if (!s) return "";
    var n = num(s.replace("%", ""));
    if (!isFinite(n)) return s;
    var raw = s.replace("%", "").trim().replace(".", ",");
    return (/^[\d,]+$/.test(raw) ? raw : frNum(n)) + " %";
  }
  // Valeur d'une ligne de plateforme : %, grands nombres compacts, tranche d'âge, texte.
  function fmtVal(key, v) {
    var s = String(v).trim();
    if (/er$|Pct$/.test(key) && key !== "bestFormatPct") return pct(s);
    if (key === "ageBracket") return s.replace(/\s*-\s*/, "–") + (/\d$/.test(s) ? " ans" : "");
    if (/^[\d\s.,  ]+[km]?$/i.test(s)) return compactTxt(s);
    return s;
  }
  function titleCase(n) {
    var s = String(n || "").trim();
    if (s !== s.toUpperCase()) return s;
    return s.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); });
  }
  function displayName(n) { return titleCase(NAME_OVERRIDES[String(n || "").trim().toLowerCase()] || n); }
  function firstName(n) { return String(n || "").trim().split(/\s+/)[0] || ""; }
  function monthFR() {
    try { var s = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); return s.charAt(0).toUpperCase() + s.slice(1); } catch (e) { return ""; }
  }
  function profileUrl(handle, platform) {
    var h = String(handle || "").replace(/^@/, "").trim(), p = String(platform || "").toLowerCase();
    if (p.indexOf("tiktok") >= 0) return "https://www.tiktok.com/@" + h;
    if (p.indexOf("youtube") >= 0) return "https://youtube.com/@" + h;
    if (p.indexOf("snap") >= 0) return "https://www.snapchat.com/add/" + h;
    if (p === "x" || p.indexOf("twitter") >= 0) return "https://x.com/" + h;
    return "https://instagram.com/" + h;
  }
  function fmtPrice(v) {
    var s = String(v == null ? "" : v).trim();
    var m = /^([\d\s.,  ]+)\s*(€|eur)?\s*(ht)?$/i.exec(s);
    if (!m) return { amount: s, ht: false };
    var n = num(m[1]);
    if (!isFinite(n) || !n) return { amount: s, ht: false };
    return { amount: frNum(n, 2) + " €", ht: true };
  }
  function bg(url) { return url ? ' style="background-image:url(&quot;' + esc(url) + '&quot;)"' : ""; }

  function normalize(row) {
    var mk = (row && row.mediakit) || {}, au = mk.audience || {};
    var platforms = (arr(mk.platforms) || []).filter(function (p) { return p && p.key; });
    return {
      name: displayName((row && row.name) || ""),
      handle: String(mk.handle || (row && row.handle) || "").replace(/^@/, ""),
      platform: String((row && row.platform) || "instagram").toLowerCase(),
      photoUrl: (row && row.photo_url) || null,
      bio: String(mk.bio || "").trim(),
      tags: (arr(mk.tags) || []).map(function (t) { return String(t).trim(); }).filter(Boolean),
      audience: { age: arr(au.age) || [], gender: au.gender || {}, pays: arr(au.pays) || [], villes: arr(au.villes) || [], formats: arr(au.formats) || [] },
      platforms: platforms,
      brands: (arr(mk.brands) || []).filter(function (b) { return b && has(b.name); }),
      photos: mk.photos || {},
      statsShots: (arr(mk.statsShots) || []).filter(Boolean),
      rates: mk.hideRates ? [] : (arr(mk.rates) || []).filter(function (r) { return r && has(r.label) && has(r.price); }),
      ratesNote: has(mk.ratesNote) ? mk.ratesNote : RATES_NOTE,
    };
  }

  // ── 1 · Couverture ─────────────────────────────────────────────────────────
  function coverFigs(data) {
    var figs = [], pls = data.platforms;
    var withF = pls.filter(function (p) { return isFinite(num(p.followers)); });
    if (withF.length) {
      var total = withF.reduce(function (a, p) { return a + num(p.followers); }, 0);
      var names = withF.map(function (p) { return PLAT_LABEL[p.key] || p.key; });
      figs.push([compactTxt(total), "abonnés" + (names.length > 1 ? ", " + names.join(" et ") : " sur " + names[0])]);
    }
    var withEr = pls.filter(function (p) { return isFinite(num(String(p.er || "").replace("%", ""))); })
      .sort(function (a, b) { return num(String(b.er).replace("%", "")) - num(String(a.er).replace("%", "")); });
    if (withEr.length) figs.push([pct(withEr[0].er), "d'engagement sur " + (PLAT_LABEL[withEr[0].key] || withEr[0].key)]);
    for (var i = 0; i < pls.length && figs.length < 3; i++) {
      var p = pls[i];
      if (has(p.impressions30j)) { figs.push([compactTxt(p.impressions30j), "impressions " + (PLAT_LABEL[p.key] || "") + ", 30 jours"]); break; }
      if (has(p.views30j)) { figs.push([compactTxt(p.views30j), "vues " + (PLAT_LABEL[p.key] || "") + ", 30 jours"]); break; }
    }
    return figs.filter(function (f) { return f[0]; }).slice(0, 3);
  }
  function buildCover(data) {
    var parts = data.name.split(/\s+/), first = parts[0] || "", rest = parts.slice(1).join(" ");
    var meta = [];
    if (has(data.handle)) meta.push('<a href="' + esc(profileUrl(data.handle, data.platform)) + '" target="_blank" rel="noreferrer">@' + esc(data.handle) + "</a>");
    data.tags.forEach(function (t) { meta.push(esc(t)); });
    var bio = data.bio ? '<div class="bio">' + data.bio.split(/\n\s*\n+/).map(function (p) { return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("") + "</div>" : "";
    var figs = coverFigs(data);
    var figsHTML = figs.length ? '<div class="figs">' + figs.map(function (f) { return "<div><b class=\"tnum\">" + esc(f[0]) + "</b>" + esc(f[1]) + "</div>"; }).join("") + "</div>" : "";
    return '<section class="pg p-cover">' +
      '<div class="ph" role="img" aria-label="' + esc(data.name) + '"' + bg(data.photos.hero || data.photoUrl) + "></div>" +
      '<div class="txt"><p class="kicker">TTP Creators · Media kit · <span class="js-month">' + monthFR() + "</span></p>" +
      '<h1 class="name">' + esc(first) + (rest ? "<i>" + esc(rest) + "</i>" : "") + "</h1>" +
      (meta.length ? '<p class="meta">' + meta.join(" · ") + "</p>" : "") + bio + figsHTML + "</div></section>";
  }

  // ── 2 · Plateformes (2 par page) ───────────────────────────────────────────
  function platCol(p, solo) {
    var label = PLAT_LABEL[p.key] || p.key;
    var big = compact(p.followers);
    var rows = (PLAT_ROWS[p.key] || PLAT_ROWS.instagram).filter(function (r) { return has(p[r[1]]); })
      .map(function (r) { return [r[0], fmtVal(r[1], p[r[1]])]; }).filter(function (r) { return r[1]; })
      .slice(0, solo ? 6 : 5);
    return '<div class="col"><h3>' + esc(label) + "</h3>" +
      (solo && PLAT_INTRO[p.key] ? '<p class="intro">' + esc(PLAT_INTRO[p.key]) + "</p>" : "") +
      (big ? '<div class="big tnum">' + esc(big.n) + (big.u ? "<small>" + big.u + "</small>" : "") + '</div><div class="under">abonnés</div>' : "") +
      (rows.length ? "<dl>" + rows.map(function (r) { return "<div><dt>" + esc(r[0]) + '</dt><dd class="tnum">' + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" : "") +
      "</div>";
  }
  function buildPlatforms(data) {
    var pls = data.platforms.filter(function (p) { return has(p.followers) || PLAT_ROWS[p.key] && PLAT_ROWS[p.key].some(function (r) { return has(p[r[1]]); }); });
    if (!pls.length) return "";
    var photo = data.photos.contact || data.photos.hero || data.photoUrl, out = "";
    for (var i = 0; i < pls.length; i += 2) {
      var pair = pls.slice(i, i + 2), solo = pair.length === 1;
      out += '<section class="pg p-plat' + (solo ? " solo" : "") + '">' + pair.map(function (p) { return platCol(p, solo); }).join("") +
        '<div class="ph" role="img" aria-label="Portrait"' + bg(photo) + "></div></section>";
    }
    return out;
  }

  // ── 3 · Audience ───────────────────────────────────────────────────────────
  function rows(list, key) {
    return list.filter(function (r) { return r && has(r[key]) && has(r.pct); }).map(function (r) {
      var label = String(r[key]).trim().replace(/\s*-\s*/, "–");
      if (/^Reunion$/i.test(label)) label = "La Réunion";
      if (key === "label" && /^\d+–\d+$|^\d+\+$/.test(label)) label += " ans";
      return '<div class="row">' + esc(label) + '<span class="lead"></span><b class="tnum">' + esc(pct(r.pct)) + "</b></div>";
    }).join("");
  }
  function buildAudience(data) {
    var a = data.audience, cols = [];
    var gf = a.gender.femmes, gh = a.gender.hommes;
    if (has(gf) && !has(gh)) gh = String(Math.max(0, 100 - num(gf)));
    else if (has(gh) && !has(gf)) gf = String(Math.max(0, 100 - num(gh)));
    var left = "";
    if (a.age.length) left += "<h4>Âge</h4>" + rows(a.age, "label");
    if (a.formats.length) left += '<h4 class="' + (left ? "gap" : "") + '">Formats regardés</h4>' + rows(a.formats, "label");
    if (left) cols.push("<div>" + left + "</div>");
    if (has(gf) || has(gh)) {
      var g = [[num(gh), "hommes"], [num(gf), "femmes"]].filter(function (x) { return isFinite(x[0]); }).sort(function (x, y) { return y[0] - x[0]; });
      cols.push("<div><h4>Genre</h4><div class=\"split\">" + g.map(function (x) {
        return '<div><b class="tnum">' + esc(pct(String(x[0])).replace(" %", "")) + "</b>% " + x[1] + "</div>";
      }).join("") + "</div></div>");
    }
    var right = "";
    if (a.pays.length) right += "<h4>Pays</h4>" + rows(a.pays, "name");
    if (a.villes.length) right += '<h4 class="' + (right ? "gap" : "") + '">Villes</h4>' + rows(a.villes, "name");
    if (right) cols.push("<div>" + right + "</div>");
    if (!cols.length) return "";
    var main = data.platforms.filter(function (p) { return p.key === data.platform; })[0] || data.platforms[0] || {};
    var src = PLAT_LABEL[main.key] || PLAT_LABEL[data.platform] || "Instagram";
    return '<section class="pg p-aud"><header><h3>Qui suit ' + esc(firstName(data.name)) + ", <i>et où</i></h3>" +
      '<p class="kicker">' + esc(src) + " · 30 derniers jours</p></header>" +
      '<div class="cols">' + cols.join("") + "</div></section>";
  }

  // ── 4 · Captures (profils + statistiques), 6 au plus ───────────────────────
  function buildShots(data) {
    var items = [];
    ["instagram", "tiktok", "youtube"].forEach(function (k) {
      if (data.photos[k]) items.push([data.photos[k], "Profil " + PLAT_LABEL[k]]);
    });
    data.statsShots.forEach(function (u) { items.push([u, "Statistiques"]); });
    items = items.slice(0, 6);
    if (!items.length) return "";
    return '<section class="pg p-shots"><header><h3>En capture, <i>sans retouche</i></h3>' +
      '<p class="kicker">Profils et statistiques des plateformes</p></header>' +
      '<div class="prints">' + items.map(function (it) {
        return '<figure><div class="frame"><img src="' + esc(it[0]) + '" alt="' + esc(it[1]) + '" loading="lazy"></div><figcaption>' + esc(it[1]) + "</figcaption></figure>";
      }).join("") + "</div></section>";
  }

  // ── 5 · Marques et tarifs ──────────────────────────────────────────────────
  function buildBrands(data) {
    var brands = data.brands, rates = data.rates;
    if (!brands.length && !rates.length) return "";
    var left = "", right = "";
    if (brands.length) {
      left = '<p class="kicker">Collaborations</p><h3>Ces marques lui ont fait confiance</h3>' +
        '<p class="credits' + (brands.length > 12 ? " long" : "") + '">' +
        brands.map(function (b) { return "<span>" + esc(String(b.name).trim()) + "</span>"; }).join(" ") + "</p>";
    }
    if (rates.length) {
      right = '<p class="kicker">Tarifs indicatifs</p><div class="rates">' + rates.map(function (r) {
        var p = fmtPrice(r.price);
        return '<div class="rate">' + esc(r.label) + '<span class="lead"></span><b class="tnum">' + esc(p.amount) + (p.ht ? "<small>HT</small>" : "") + "</b></div>" +
          (has(r.detail) ? '<p class="rate-detail">' + esc(r.detail) + "</p>" : "");
      }).join("") + '</div><p class="note">' + esc(data.ratesNote) + "</p>";
    }
    var one = !left || !right;
    return '<section class="pg p-brands' + (one ? " one" : "") + '">' +
      (left ? '<div class="l">' + left + "</div>" : "") + (right ? '<div class="' + (left ? "r" : "l") + '">' + right + "</div>" : "") + "</section>";
  }

  // ── 6 · Contact ────────────────────────────────────────────────────────────
  function buildContact(data) {
    return '<section class="pg p-contact"><div class="txt"><p class="kicker">Contact</p>' +
      "<h2>Travaillons<i>ensemble</i></h2>" +
      '<div class="ways">' +
      '<div><span>E-mail</span><a href="mailto:partnerships@ttpcreators.pro">partnerships@ttpcreators.pro</a></div>' +
      '<div><span>Téléphone</span><a class="tnum" href="tel:+33766259803">07 66 25 98 03</a></div>' +
      '<div><span>Instagram</span><a href="https://instagram.com/ttpcreators" target="_blank" rel="noreferrer">@ttpcreators</a></div></div>' +
      '<div class="foot"><span>TTP Creators · Talent management · Lyon et Genève</span><span>Media kit ' + esc(data.name) + ' · <span class="js-month">' + monthFR() + "</span></span></div></div>" +
      '<div class="ph" role="img" aria-label="' + esc(data.name) + '"' + bg(data.photos.contact || data.photos.hero || data.photoUrl) + "></div></section>";
  }

  function build(data) {
    return buildCover(data) + buildPlatforms(data) + buildAudience(data) + buildShots(data) + buildBrands(data) + buildContact(data);
  }

  var kit = document.getElementById("kit"), bar = document.getElementById("progress");
  function paint(data) {
    kit.innerHTML = build(data);
    if (data.name) document.title = "Media Kit — " + data.name + " · TTP Creators";
  }
  function onScroll() {
    var h = d.scrollHeight - d.clientHeight, top = d.scrollTop || document.body.scrollTop || 0;
    if (bar) bar.style.width = (h > 0 ? (top / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // 1) Rendu immédiat depuis la donnée bakée (PDF déterministe en CI).
  var baked = window.MK || {};
  applyTheme((baked.mediakit || {}).theme);
  paint(normalize(baked));
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

  // 2) Contenu à jour (page web) : ligne lue par NOM réel.
  var name = baked.name || "";
  if (name) {
    try {
      fetch(SB_URL + "/rest/v1/public_mediakit?select=name,handle,platform,photo_url,mediakit&name=eq." + encodeURIComponent(name), {
        headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rs) { if (rs && rs.length) { applyTheme((rs[0].mediakit || {}).theme); paint(normalize(rs[0])); onScroll(); } })
        .catch(function () {});
    } catch (e) {}
  }
})();
