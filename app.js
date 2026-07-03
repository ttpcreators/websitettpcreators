/* =========================================================
   TTP Creators — interactions (vanilla, style cinématique)
   Glow souris, nav mobile, header au scroll, compteurs, roster tactile.
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Glow organique qui suit la souris (hero) ---------- */
  var hero = document.querySelector("[data-hero]");
  var glow = document.querySelector("[data-glow]");
  if (hero && glow && !reduce) {
    var raf = null, mx = 0, my = 0;
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        glow.style.setProperty("--mx", mx + "px");
        glow.style.setProperty("--my", my + "px");
        glow.style.setProperty("--r", "260px");
        raf = null;
      });
    });
    hero.addEventListener("mouseleave", function () {
      glow.style.setProperty("--r", "0px");
    });
  }

  /* ---------- Header : fond au scroll ---------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu mobile (dropdown verre) ---------- */
  var burger = document.querySelector("[data-burger]");
  var panel = document.querySelector("[data-menu]");
  if (burger && panel) {
    var toggle = function (open) {
      var isOpen = open === undefined ? !panel.classList.contains("open") : open;
      panel.classList.toggle("open", isOpen);
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    };
    burger.addEventListener("click", function () { toggle(); });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { toggle(false); });
    });
  }

  /* ---------- Smooth scroll ancres ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- Reveal au scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Compteurs (stats) ---------- */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    var dur = 1400, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      var s = String(val);
      if (pad > 0) while (s.length < pad) s = "0" + s;
      el.textContent = prefix + s + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    if (reduce) {
      var s = String(target); if (pad > 0) while (s.length < pad) s = "0" + s;
      el.textContent = prefix + s + suffix; return;
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-counter]").forEach(function (el) { cio.observe(el); });
  } else {
    document.querySelectorAll("[data-counter]").forEach(runCounter);
  }

  /* ---------- Formulaire contact (mailto de repli) ---------- */
  var CONTACT_EMAIL = "partnerships@ttpcreators.pro";
  var form = document.querySelector("[data-form]");
  if (form) {
    var segs = form.querySelectorAll("[data-seg]");
    var profil = form.querySelector('input[name="profil"]');
    segs.forEach(function (b) {
      b.addEventListener("click", function () {
        segs.forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
        b.classList.add("active"); b.setAttribute("aria-pressed", "true");
        if (profil) profil.value = b.getAttribute("data-val");
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get("company")) return; // honeypot
      var body = "Profil: " + (fd.get("profil") || "") + "\n" +
        "Nom: " + (fd.get("nom") || "") + "\n" +
        "Email: " + (fd.get("email") || "") + "\n\n" + (fd.get("message") || "");
      var note = form.querySelector("[data-form-note]");
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent("Contact site — " + (fd.get("nom") || "")) +
        "&body=" + encodeURIComponent(body);
      if (note) { note.textContent = "Ton client mail vient de s'ouvrir. Sinon écris-nous à " + CONTACT_EMAIL; note.style.opacity = "1"; }
    });
  }
})();
