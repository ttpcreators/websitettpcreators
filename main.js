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
  var CONTACT_EMAIL = "hello@ttpcreators.com";
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
