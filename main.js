/* =========================================================
   TTP Creators — interactions
   ========================================================= */
(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");

  /* ----- Sticky nav state ----- */
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Mobile menu ----- */
  if (burger) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ----- Scroll reveal ----- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ----- Animated stat counters ----- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            co.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ----- Contact form (Formspree + repli mailto) ----- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const CONTACT_EMAIL = "hello@ttpcreators.com";

  const setStatus = (msg, ok) => {
    if (!status) return;
    status.style.color = ok ? "var(--accent)" : "#c0392b";
    status.textContent = msg;
  };

  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const data = new FormData(form);

      // Honeypot : si rempli, c'est un bot -> on ignore silencieusement
      if ((data.get("_gotcha") || "").toString().trim() !== "") return;

      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const profile = (data.get("profile") || "").toString().trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !validEmail || !message) {
        setStatus("Merci de remplir tous les champs avec un email valide.", false);
        return;
      }

      const action = form.getAttribute("action") || "";
      const configured = action.includes("formspree.io") && !action.includes("votre-id");

      // Repli mailto tant que Formspree n'est pas configuré : ouvre le client mail pré-rempli
      if (!configured) {
        const subject = encodeURIComponent("Nouvelle demande - " + name);
        const body = encodeURIComponent(
          "Nom : " + name + "\nEmail : " + email + "\nProfil : " + profile + "\n\n" + message
        );
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
        setStatus("On ouvre ton client mail pour finaliser l'envoi.", true);
        return;
      }

      // Envoi réel via Formspree
      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours..."; }
      setStatus("Envoi en cours...", true);

      try {
        const res = await fetch(action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          form.reset();
          setStatus("Merci " + name + ", message bien reçu. On revient vers toi sous 48h.", true);
        } else {
          setStatus("Une erreur est survenue. Réessaie ou écris-nous à " + CONTACT_EMAIL + ".", false);
        }
      } catch (e) {
        setStatus("Connexion impossible. Réessaie ou écris-nous à " + CONTACT_EMAIL + ".", false);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });
  }

  /* ----- Scroll progress bar + back-to-top ----- */
  const progress = document.getElementById("scrollProgress");
  const toTop = document.getElementById("toTop");
  const onScrollProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    if (progress) progress.style.transform = "scaleX(" + ratio + ")";
    if (toTop) toTop.classList.toggle("show", doc.scrollTop > 600);
  };
  window.addEventListener("scroll", onScrollProgress, { passive: true });
  onScrollProgress();
  if (toTop) {
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

})();
