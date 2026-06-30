/* =========================================================
   TTP Creators — EncryptedText (effet décodage, vanilla)
   Portage du composant React « EncryptedText » : chaque libellé
   apparaît chiffré (caractères qui défilent) puis se révèle, lettre
   par lettre, quand il entre dans le viewport. Aucune dépendance.
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%&/<>*+=÷×".split("");
  var SCRAMBLE_MS = 45; // cadence de rafraîchissement des caractères chiffrés

  function decode(el) {
    if (el.dataset.encDone) return;
    el.dataset.encDone = "1";

    var text = el.textContent;
    var delay = parseInt(el.getAttribute("data-reveal-delay") || "45", 10);

    var frag = document.createDocumentFragment();
    var cells = [];
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var s = document.createElement("span");
      s.className = "enc-c";
      if (ch === " ") {
        s.innerHTML = "&nbsp;";
        cells.push({ s: s, ch: ch, space: true });
      } else {
        s.textContent = ch;
        s.classList.add("scz");
        cells.push({ s: s, ch: ch, space: false });
      }
      frag.appendChild(s);
    }
    el.textContent = "";
    el.appendChild(frag);

    if (reduce) {
      cells.forEach(function (c) { c.s.textContent = c.ch; c.s.classList.remove("scz"); });
      return;
    }

    var startTs = null, lastScr = 0;
    function frame(ts) {
      if (startTs === null) startTs = ts;
      var revealed = Math.floor((ts - startTs) / delay);
      var doScramble = (ts - lastScr) > SCRAMBLE_MS;
      if (doScramble) lastScr = ts;
      var done = true;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        if (c.space) continue;
        if (i < revealed) {
          if (c.s.classList.contains("scz")) {
            c.s.textContent = c.ch;
            c.s.classList.remove("scz");
          }
        } else {
          done = false;
          if (doScramble) c.s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      if (!done) requestAnimationFrame(frame);
      else cells.forEach(function (c) { if (!c.space) { c.s.textContent = c.ch; c.s.classList.remove("scz"); } });
    }
    requestAnimationFrame(frame);
  }

  var els = Array.prototype.slice.call(document.querySelectorAll("[data-encrypted]"));
  if (!els.length) return;

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { decode(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(decode);
  }
})();
