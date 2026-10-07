/* ============================================================================
 * Media kits — langue de la page (FR par défaut, EN pour les marques étrangères).
 * Chargé AVANT kit-editorial.js / agence-editorial.js. La langue vient de
 * <html lang="…"> (les pages /en/ sont générées par _build_mediakits.py) ;
 * ?lang=en|fr force la langue pour un aperçu.
 *
 * `val()` traduit les VALEURS saisies en français dans l'app quand elles font
 * partie d'un vocabulaire connu (formats, pays, villes, étiquettes, tarifs,
 * précisions du casting). Un texte inconnu reste tel quel. Les textes libres
 * (bio, textes de l'agence, concepts) ont leurs champs anglais dans l'app.
 * ========================================================================== */
(function () {
  "use strict";
  var forced = (function () { try { return new URLSearchParams(location.search).get("lang"); } catch (e) { return null; } })();
  var lang = (forced || document.documentElement.getAttribute("lang") || "fr").slice(0, 2).toLowerCase() === "en" ? "en" : "fr";
  if (forced) document.documentElement.setAttribute("lang", lang);

  // Clés en minuscules, sans accents, espaces/tirets normalisés (voir norm()).
  var V = {
    // Formats
    "reels": "Reels", "reel": "Reels", "story": "Stories", "stories": "Stories",
    "publications": "Posts", "publication": "Posts", "posts": "Posts", "post": "Posts",
    "carrousel": "Carousels", "carrousels": "Carousels", "lives": "Lives", "live": "Lives",
    "videos": "Videos", "video": "Videos", "shorts": "Shorts",
    // Pays
    "france": "France", "belgique": "Belgium", "suisse": "Switzerland", "canada": "Canada",
    "maroc": "Morocco", "etats unis": "United States", "usa": "United States", "us": "United States",
    "italie": "Italy", "inde": "India", "india": "India", "royaume uni": "United Kingdom", "uk": "United Kingdom",
    "allemagne": "Germany", "espagne": "Spain", "portugal": "Portugal", "japon": "Japan",
    "algerie": "Algeria", "tunisie": "Tunisia", "pays bas": "Netherlands", "luxembourg": "Luxembourg",
    "la reunion": "Réunion", "reunion": "Réunion", "senegal": "Senegal", "cote d'ivoire": "Ivory Coast",
    "bresil": "Brazil", "mexique": "Mexico", "grece": "Greece", "autriche": "Austria", "irlande": "Ireland",
    "suede": "Sweden", "pologne": "Poland", "chine": "China", "turquie": "Turkey", "liban": "Lebanon",
    "australie": "Australia", "monaco": "Monaco", "emirats arabes unis": "United Arab Emirates",
    "dubai": "Dubai", "dubaï": "Dubai",
    // Villes
    "geneve": "Geneva", "bruxelles": "Brussels", "londres": "London", "lisbonne": "Lisbon",
    "alger": "Algiers", "aix en provence": "Aix-en-Provence", "aix en provences": "Aix-en-Provence",
    "montreal": "Montreal", "anvers": "Antwerp", "bale": "Basel", "zurich": "Zurich", "lausanne": "Lausanne",
    // Univers, étiquettes
    "lifestyle": "Lifestyle", "sport": "Sport", "mode": "Fashion", "beaute": "Beauty", "humour": "Humor",
    "therapies holistiques": "Holistic therapies", "cross fit": "CrossFit", "crossfit": "CrossFit",
    "triathlon": "Triathlon", "sud de la france": "South of France", "aventure": "Adventure",
    "voyage": "Travel", "voyages": "Travel", "food": "Food", "sante": "Health", "health": "Health",
    "bien etre": "Wellness", "maman": "Motherhood", "famille": "Family", "deco": "Home decor",
    "decoration": "Home decor", "blogging": "Blogging", "fitness": "Fitness", "running": "Running",
    "musculation": "Strength training", "yoga": "Yoga", "danse": "Dance", "cuisine": "Cooking",
    "gaming": "Gaming", "luxe": "Luxury", "ugc": "UGC", "skincare": "Skincare", "streetwear": "Streetwear",
    // Tarifs (intitulés proposés par l'app)
    "story instagram": "Instagram Story", "post instagram": "Instagram Post", "reel instagram": "Instagram Reel",
    "video tiktok": "TikTok Video", "contenu ugc": "UGC Content", "pack sur mesure": "Custom Package",
    // Précisions du casting
    "quotidien": "Daily", "peau seche": "Dry skin", "peau sensible": "Sensitive skin", "peau grasse": "Oily skin",
    "peau mixte": "Combination skin", "experte": "Expert", "expert": "Expert", "healthy": "Healthy",
    "occasionnel": "Occasional", "regulier": "Regular", "en couple": "In a relationship",
  };
  function norm(s) {
    return String(s == null ? "" : s).trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[-_\s]+/g, " ");
  }
  function val(s) {
    if (lang !== "en" || s == null) return s;
    var raw = String(s).trim(), k = norm(raw);
    if (V[k]) return V[k];
    // « 1 chien », « 2 chats »…
    var m = /^(\d+)\s+(chien|chat)s?$/.exec(k);
    if (m) return m[1] + " " + (m[2] === "chien" ? "dog" : "cat") + (m[1] === "1" ? "" : "s");
    // Tranches d'âge (« 18-24 ») : tiret typographique
    if (/^\d+\s*-\s*\d+$/.test(raw)) return raw.replace(/\s*-\s*/, "–");
    return raw;
  }
  // Bios déjà traduites (par l'agence, 2026-10-07), retrouvées par leur texte français :
  // tant que la bio française n'est pas modifiée, sa version anglaise s'affiche sans
  // rien saisir. Une bio anglaise saisie dans l'app (champ bioEn) passe toujours avant.
  var BIO_EN = {
    "chloe est une creatrice fitness lifestyle basee a paris ambassadrice women s best et fashion nova avec une esthetique soignee et une communaute de 226k abonnes ": "Chloé is a Paris-based fitness & lifestyle creator, ambassador for Women's Best and Fashion Nova, with a polished aesthetic and a loyal community of 226K followers.\n\nHer content blends workouts, self-care, food and the Parisian art of living, for a young, aspirational female audience drawn to performance and everyday elegance.",
    "lena est une creatrice de contenu lifestyle beaute et sport qui produit des contenus 100 aesthetic penses pour convertir basee a aubagne elle a deja accompagne ": "Léna is a lifestyle, beauty and fitness creator producing 100% aesthetic content, designed to convert.\n\nBased in Aubagne, in the South of France, she has already worked with more than 50 brands through a native, high-quality UGC approach.",
    "lucie est une creatrice humour lifestyle basee a lyon avec une approche decalee et authentique qui transforme le quotidien en contenu addictif son contenu mele ": "Lucie is a Lyon-based humor & lifestyle creator whose offbeat, authentic approach turns everyday life into addictive content.\n\nHer content blends relatable everyday moments, unapologetic tongue-in-cheek humor and a polished lifestyle aesthetic, for a young female audience who sees herself in it as much as she laughs along.",
    "candice est une creatrice lifestyle blogging basee a paris etudiante a l escp entre voyages culture pop et contenus spontanes elle partage un univers jeune colo": "Candice is a Paris-based lifestyle & blogging creator and a student at ESCP Business School.\n\nBetween travel, pop culture and spontaneous content, she shares a young, colorful, unfiltered world.",
    "pierre est un triathlete amateur qui partage sa preparation ses courses et ses conseils matos avec une communaute d endurants engagee base sur un contenu sincer": "Pierre is an amateur triathlete who shares his training, races and gear advice with an engaged community of endurance athletes.\n\nWith sincere, sporty and polished content, he has been racing Ironman events for three years and reaches 6,176 followers with an authentic approach that makes people want to get moving.",
    "beverly est une creatrice digitale mode lifestyle basee entre la france et les etats unis avec une presence internationale forte miami new york ibiza dubai son ": "Beverly is a fashion & lifestyle digital creator based between France and the United States, with a strong international presence (Miami, New York, Ibiza, Dubai).\n\nHer content blends a polished editorial aesthetic with stories of life between two continents, for a young, aspirational audience.",
    "ana est une creatrice de contenu et entrepreneuse a l univers artistique et sensible qui place le pouvoir des emotions au cur de chacun de ses contenus suivie p": "Ana is a content creator and entrepreneur with an artistic, sensitive world, putting the power of emotion at the heart of everything she creates.\n\nFollowed by 238,000 people, founder of the brand @co.ames and co-founder of the non-profit @akpeleau, she brings together a community drawn to her eye, her refined aesthetic and her sincerity.",
    "justine est une creatrice sport lifestyle mariee a un ironman crossfiteuse et baby triathlete qui documente sa vie active avec une authenticite rare et communic": "Justine is a sport & lifestyle creator married to an Ironman, a CrossFitter and budding triathlete who documents her active life with rare, infectious authenticity.\n\nHer content blends training, adventure travel and life as a sporty couple, for an engaged audience that shares the same values of effort and pushing past their limits.",
    "lea est une creatrice lifestyle blogging basee dans le sud de la france entre voyages ensoleilles moments du quotidien et contenus spontanes elle partage un uni": "Léa is a lifestyle & blogging creator based in the South of France.\n\nBetween sun-soaked travels, everyday moments and spontaneous content, she shares a warm, authentic world."
  };
  function bioKey(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, " ").trim().slice(0, 160);
  }
  function bioEn(mk) {
    mk = mk || {};
    if (mk.bioEn && String(mk.bioEn).trim()) return String(mk.bioEn);
    return BIO_EN[bioKey(mk.bio)] || "";
  }
  var EN = lang === "en";
  window.MKI18N = {
    lang: lang,
    en: EN,
    locale: EN ? "en-US" : "fr-FR",
    val: val,
    bioEn: bioEn,
    // Choisit le texte selon la langue : L("Abonnés", "Followers").
    L: function (fr, en) { return EN ? en : fr; },
    list: function (xs) {
      xs = (xs || []).filter(Boolean);
      return xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + (EN ? " and " : " et ") + xs[xs.length - 1];
    },
    month: function () {
      try {
        var s = new Date().toLocaleDateString(EN ? "en-US" : "fr-FR", { month: "long", year: "numeric" });
        return s.charAt(0).toUpperCase() + s.slice(1);
      } catch (e) { return ""; }
    },
  };
})();
