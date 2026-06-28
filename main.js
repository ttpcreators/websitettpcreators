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

  /* ----- Contact form (front-end demo handling) ----- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !validEmail || !message) {
        status.style.color = "#ff6b6b";
        status.textContent = "Merci de remplir tous les champs avec un email valide.";
        return;
      }
      status.style.color = "var(--accent)";
      status.textContent = "Merci " + name + ", message bien reçu. On revient vers toi sous 48h.";
      form.reset();
    });
  }

  /* ----- Creators spotlight ----- */
  const crItems = Array.from(document.querySelectorAll(".cr-item"));
  const crImg = document.getElementById("crImg");
  const PLATFORM_SVG = {
    Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    TikTok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.3 1.7 3.8 4 4v3c-1.5 0-2.9-.4-4-1.2V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1A3 3 0 1 0 13 15V3h3z"/></svg>',
    YouTube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg>'
  };

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const selectCreator = (btn, index) => {
    crItems.forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");

    const d = btn.dataset;
    setText("crName", d.name);
    setText("crNiche", d.niche);
    setText("crBio", d.bio);
    setText("crFollowers", d.followers);
    setText("crEng", d.eng);
    setText("crViews", d.views);
    setText("crRank", String(index + 1).padStart(2, "0") + " / " + String(crItems.length).padStart(2, "0"));

    const platBox = document.getElementById("crPlatforms");
    if (platBox) {
      platBox.innerHTML = (d.platforms || "")
        .split(",")
        .filter(Boolean)
        .map((p) => '<a href="#" aria-label="' + p + '">' + (PLATFORM_SVG[p] || "") + "</a>")
        .join("");
    }

    if (crImg) {
      crImg.classList.add("swapping");
      const newSrc = d.img;
      const pre = new Image();
      pre.onload = () => { crImg.src = newSrc; crImg.alt = "Portrait de " + d.name; crImg.classList.remove("swapping"); };
      pre.onerror = () => { crImg.classList.remove("swapping"); };
      pre.src = newSrc;
      // Fallback in case the image is cached and onload does not fire promptly
      setTimeout(() => crImg.classList.remove("swapping"), 500);
    }
  };

  crItems.forEach((btn, i) => {
    btn.addEventListener("click", () => selectCreator(btn, i));
    btn.addEventListener("mouseenter", () => selectCreator(btn, i));
  });
  // Initialise platforms/rank for the default active item
  const active = crItems.find((b) => b.classList.contains("is-active"));
  if (active) selectCreator(active, crItems.indexOf(active));
})();
