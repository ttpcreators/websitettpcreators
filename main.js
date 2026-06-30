/* =========================================================
   TTP Creators — interactions (design Claude Design)
   ========================================================= */
(function () {
  "use strict";

  /* ----- Menu mobile ----- */
  var burger = document.querySelector("[data-burger]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (burger && panel) {
    burger.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        panel.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----- Nav pilule : curseur glissant ----- */
  var pillNav = document.querySelector("[data-pillnav]");
  if (pillNav) {
    var cursor = pillNav.querySelector("[data-pill-cursor]");
    var pillLinks = Array.prototype.slice.call(pillNav.querySelectorAll("a"));
    var moveCursor = function (a) {
      cursor.style.width = a.offsetWidth + "px";
      cursor.style.height = a.offsetHeight + "px";
      cursor.style.left = a.offsetLeft + "px";
      cursor.style.top = a.offsetTop + "px";
      cursor.style.opacity = "1";
    };
    pillLinks.forEach(function (a) {
      a.addEventListener("mouseenter", function () {
        if (cursor) moveCursor(a);
        a.style.color = "#0b0c0e";
      });
      a.addEventListener("mouseleave", function () {
        a.style.color = "rgba(242,243,245,0.72)";
      });
    });
    pillNav.addEventListener("mouseleave", function () {
      if (cursor) cursor.style.opacity = "0";
    });
  }

  /* ----- Toggle « Tu es » (Créateur / Marque) ----- */
  var segs = Array.prototype.slice.call(document.querySelectorAll("[data-seg]"));
  var profil = document.getElementById("dcProfil");
  segs.forEach(function (b) {
    b.addEventListener("click", function () {
      segs.forEach(function (x) {
        x.setAttribute("aria-pressed", "false");
        x.style.background = "transparent";
        x.style.color = "#cfd1d6";
        x.style.borderColor = "rgba(255,255,255,0.14)";
      });
      b.setAttribute("aria-pressed", "true");
      b.style.background = "var(--accent,#c75265)";
      b.style.color = "#0b0c0e";
      b.style.borderColor = "transparent";
      if (profil) profil.value = b.getAttribute("data-val") || "";
    });
  });

  /* ----- Compteurs de stats ----- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-counter]"));
  var render = function (el, val) {
    var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    var num = String(Math.round(val));
    if (pad > 0) while (num.length < pad) num = "0" + num;
    el.textContent = (el.getAttribute("data-prefix") || "") + num + (el.getAttribute("data-suffix") || "");
  };
  var runCounter = function (el) {
    var target = parseFloat(el.getAttribute("data-target") || "0");
    if (reduce) { render(el, target); return; }
    var dur = 1500, start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      render(el, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { render(el, parseFloat(el.getAttribute("data-target") || "0")); });
  }

  /* ----- Retour en haut ----- */
  var toTop = document.querySelector("[data-top]");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener(
      "scroll",
      function () {
        toTop.classList.toggle("show", window.scrollY > 600);
      },
      { passive: true }
    );
  }

  /* ----- Formulaire (Formspree + repli mailto + honeypot) ----- */
  var form = document.getElementById("dcForm");
  var CONTACT_EMAIL = "partnerships@ttpcreators.pro";
  if (form) {
    var note = document.createElement("p");
    note.setAttribute("role", "status");
    note.style.cssText = "margin:14px 0 0;font-size:14px;min-height:1.2em;color:var(--accent,#c75265)";
    form.appendChild(note);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      if ((data.get("company") || "").toString().trim() !== "") return; // honeypot
      var nom = (data.get("nom") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var msg = (data.get("message") || "").toString().trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!nom || !okEmail || !msg) {
        note.style.color = "#ff8a80";
        note.textContent = "Merci de remplir tous les champs avec un email valide.";
        return;
      }
      var action = form.getAttribute("action") || "";
      var configured = action.indexOf("formspree.io") !== -1 && action.indexOf("votre-id") === -1;

      if (!configured) {
        var subject = encodeURIComponent("Nouvelle demande - " + nom);
        var bodyTxt = encodeURIComponent(
          "Nom : " + nom + "\nEmail : " + email +
          "\nProfil : " + (data.get("profil") || "") + "\n\n" + msg
        );
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + bodyTxt;
        note.style.color = "var(--accent,#c75265)";
        note.textContent = "On ouvre ton client mail pour finaliser l'envoi.";
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Envoi..."; }
      note.style.color = "var(--accent,#c75265)";
      note.textContent = "Envoi en cours...";

      fetch(action, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (profil) profil.value = "Créateur";
            note.textContent = "Merci " + nom + ", message bien reçu. On revient vers toi sous 48h.";
          } else {
            note.style.color = "#ff8a80";
            note.textContent = "Une erreur est survenue. Écris-nous à " + CONTACT_EMAIL + ".";
          }
        })
        .catch(function () {
          note.style.color = "#ff8a80";
          note.textContent = "Connexion impossible. Écris-nous à " + CONTACT_EMAIL + ".";
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  }
})();

/* ===== Roster dynamique : lit le roster de l'agence depuis Supabase (vue publique
   public_roster : champs publics uniquement) et remplace les cartes. Quand l'agence
   ajoute un créateur dans l'app, il apparaît ici automatiquement. Repli : si le
   chargement échoue, les cartes statiques de la page restent affichées. ===== */
(function () {
  var SB_URL = "https://tytbkyyfhlyhxpbcwnkw.supabase.co";
  var SB_KEY = "sb_publishable_LQS5P8cn2kd8pKnN7kiilg_y9UgGLAx";
  var grid = document.getElementById("roster-grid");
  if (!grid) return;

  var IG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>';

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function titleCase(s) { return String(s || "").toLowerCase().replace(/(^|[\s\-'’])([\wà-ÿ])/g, function (m, a, b) { return a + b.toUpperCase(); }); }
  function igUser(h) { return String(h || "").replace(/^@/, "").trim(); }

  function card(c) {
    var niche = esc(c.niche || "");
    var name = esc(titleCase(c.name));
    var handle = esc(c.handle || "");
    var user = igUser(c.handle);
    var hasIg = user && user.toLowerCase() !== "nouveau";
    var photo = c.photo_url ? '<img class="cr-photo" src="' + esc(c.photo_url) + '" alt="' + name + '" loading="lazy" onerror="this.remove()">' : '';
    var social = hasIg ? '<a href="https://instagram.com/' + esc(user) + '" target="_blank" rel="noopener" aria-label="Instagram" style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;color:#f2f3f5;transition:background .3s, color .3s">' + IG + '</a>' : '';
    return '<article data-niche="' + niche + '" data-reveal="" onmouseenter="" onmouseleave="" style="position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--line);background:#0e0f12;transition:border-color .4s">'
      + '<div style="position:relative;width:100%;aspect-ratio:4/5;overflow:hidden">'
      + '<div data-img="" role="img" aria-label="Portrait" style="position:absolute;inset:0;background:repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 12px), linear-gradient(160deg,#17181c,#0e0f12);transition:transform .9s cubic-bezier(.16,1,.3,1)"></div>' + photo
      + '<div data-badge="" style="position:absolute;top:12px;left:12px;background:rgba(11,12,14,0.55);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.12);padding:5px 11px;border-radius:100px;font-size:11px;letter-spacing:.04em;color:#f2f3f5">' + niche + '</div>'
      + '<div data-overlay="" style="position:absolute;inset:0;background:linear-gradient(0deg, rgba(11,12,14,0.94) 12%, rgba(11,12,14,0.2) 70%);opacity:0;transform:translateY(8px);transition:opacity .4s, transform .4s;display:flex;flex-direction:column;justify-content:flex-end;gap:12px;padding:16px">'
      + '<div style="display:flex;align-items:center;gap:8px">' + social + '<a href="#contact" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#fff">Collaborer <span style="color:var(--accent,#c75265)">›</span></a></div>'
      + '</div></div>'
      + '<div style="padding:14px 14px 16px"><div style="font-weight:600;font-size:16px;letter-spacing:-0.01em;color:#f2f3f5">' + name + '</div><div style="font-size:13px;color:var(--gray,#9a9da4)">' + handle + '</div></div>'
      + '</article>';
  }

  fetch(SB_URL + "/rest/v1/public_roster?select=name,handle,niche,platform,photo_url&order=sort_order", { headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (rows) {
      if (!Array.isArray(rows) || !rows.length) return; // repli : on garde les cartes statiques
      grid.innerHTML = rows.map(card).join("");
      var sub = document.getElementById("roster-count");
      if (sub) sub.textContent = rows.length + " créatrice" + (rows.length > 1 ? "s" : "") + ", deux univers : Sport et Lifestyle. Survole une carte pour collaborer.";
    })
    .catch(function () { /* repli : les cartes statiques restent affichées */ });
})();
