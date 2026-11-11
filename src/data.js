// Toutes les données du site — textes, roster de repli, clients, services.
// Le roster affiché en priorité vient de Supabase (vue public_roster) ;
// cette liste statique sert de repli si le réseau échoue.

export const asset = (p) => `${import.meta.env.BASE_URL}${p}`

export const CONTACT_EMAIL = 'partnerships@ttpcreators.pro'

export const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/ttpcreators/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ttp-creators/' },
]

export const NAV_LINKS = [
  { href: '#about', label: 'À propos' },
  { href: '#services', label: 'Services' },
  { href: '#method', label: 'Méthode' },
  { href: '#network', label: 'Notre réseau' },
  { href: '#roster', label: 'Roster' },
  { href: '#story', label: 'Notre histoire' },
  { href: '#contact', label: 'Contact' },
]

export const CLIENTS = [
  { name: 'Tesla', file: 'tesla.png' },
  { name: 'Ray-Ban', file: 'ray-ban.png' },
  { name: 'HP', file: 'hp.png' },
  { name: 'Speedo', file: 'speedo.png' },
  { name: 'Palladium', file: 'palladium.png' },
  { name: 'Bumble', file: 'bumble.png' },
  { name: 'Magnum', file: 'magnum.png' },
  { name: 'Qonto', file: 'quonto.png' },
  { name: 'Nutripure', file: 'nutripure.png' },
  { name: 'So Shape', file: 'so-shape.png' },
  { name: 'Novoma', file: 'novoma.png' },
]

export const PILLARS = [
  {
    title: "Talent d'abord",
    text: "Un créateur n'est pas une audience : c'est une marque. On construit une identité qui dure, pas des pics de vues.",
  },
  {
    title: 'Studio intégré',
    text: 'Stratégie, production, négociation : tout se passe en interne. Une seule équipe, aucune perte en ligne.',
  },
  {
    title: 'Résultats mesurés',
    text: 'Pas de feeling : des KPIs clairs et un reporting précis, à chaque collaboration.',
  },
]

export const SERVICES = [
  {
    big: true,
    title: 'Talent Management',
    text: 'Carrière, négociations, planning et développement de revenus. On gère la structure, le créateur se concentre sur la création.',
    tags: ['Carrière', 'Deals', 'Planning'],
  },
  {
    title: 'Production de contenu',
    text: 'Direction artistique, tournage, montage, photo. Du contenu prêt à publier, pensé pour chaque plateforme.',
    tags: ['Photo', 'Vidéo', 'DA'],
  },
  {
    title: 'Stratégie social media',
    text: 'Ligne éditoriale, formats, calendrier et lecture des performances. Une croissance qui ne doit rien au hasard.',
    tags: ['Édito', 'Calendrier', 'Analytics'],
  },
  {
    title: 'Partenariats marques',
    text: 'Sourcing, brief, activation et reporting. On connecte les bonnes marques aux bons talents.',
    tags: ['Sourcing', 'Campagnes', 'Reporting'],
  },
]

export const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Snapchat', 'Twitch']

export const STEPS = [
  {
    title: 'Le brief',
    text: "Vous nous donnez l'objectif, la cible, le budget et les dates. On vous répond sous 48 h.",
  },
  {
    title: 'Le casting',
    text: 'On vous propose les créateurs adaptés, avec leur media kit, leurs chiffres et leurs tarifs.',
  },
  {
    title: 'La campagne',
    text: "Contrat, droits, idées de contenus : tout est validé avec vous avant la publication.",
  },
  {
    title: 'Le bilan',
    text: 'Vues, engagement, clics : vous recevez un rapport chiffré à la fin de chaque collaboration.',
  },
]

export const STATS = [
  { target: 50, prefix: '+', label: 'Campagnes livrées' },
  { target: 99, suffix: '%', label: 'Satisfaction clients' },
  { target: 8, pad: 2, label: 'Créateurs signés' },
  { target: 5, pad: 2, label: 'Plateformes couvertes' },
]

export const ROSTER_FALLBACK = [
  { name: 'Mathilde Viot', handle: '@mathild.e_', niche: 'Sport', photo: 'assets/creators/mathilde.webp' },
  { name: 'Margaux Bekhdadi', handle: '@maybefeelgood_', niche: 'Sport', photo: 'assets/creators/margaux.webp' },
  { name: 'Candice Maissa', handle: '@candicemaissa', niche: 'Lifestyle', photo: 'assets/creators/candice.webp' },
  { name: 'Justine Flotte', handle: '@jufrasca__', niche: 'Lifestyle', photo: 'assets/creators/justine.webp' },
  { name: 'Léna Pasquale', handle: '@lenaa.psl', niche: 'Sport', photo: 'assets/creators/lena.webp' },
  { name: 'Irina Sambucini', handle: '@irina.smb', niche: 'Lifestyle', photo: 'assets/creators/irina.webp' },
  { name: 'Lucie Botans', handle: '@lucie.bots', niche: 'Lifestyle', photo: 'assets/creators/lucie.webp' },
  { name: 'Beverly Filoni', handle: '@beverly.filoni', niche: 'Lifestyle', photo: 'assets/creators/beverly.webp' },
]

export const TIMELINE = [
  {
    year: '2022',
    title: 'TTP Agency',
    text: "Naissance de l'agence de communication : stratégie de marque, création et campagnes.",
  },
  {
    year: "Aujourd'hui",
    title: 'TTP Creators',
    text: 'Le talent management comme évidence : les créateurs au cœur des marques.',
  },
]
