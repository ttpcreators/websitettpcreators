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
    text: "Une créatrice n'est pas une audience : c'est une marque. On construit une identité qui dure, pas des pics de vues.",
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
    text: 'Carrière, négociations, planning et développement de revenus. On gère la structure, tu te concentres sur la création.',
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
    title: 'Découverte',
    text: "Objectifs, audience, positionnement : on apprend à te connaître avant de parler stratégie.",
  },
  {
    title: 'Stratégie',
    text: 'On pose la ligne, les formats et le plan de croissance. Noir sur blanc.',
  },
  {
    title: 'Production',
    text: "On crée, on optimise, on publie. Chaque contenu a un rôle précis.",
  },
  {
    title: 'Croissance',
    text: 'On mesure, on ajuste, et on active les bonnes marques au bon moment.',
  },
]

export const STATS = [
  { target: 50, prefix: '+', label: 'Campagnes livrées' },
  { target: 99, suffix: '%', label: 'Satisfaction clients' },
  { target: 8, pad: 2, label: 'Créatrices signées' },
  { target: 5, pad: 2, label: 'Plateformes couvertes' },
]

export const ROSTER_FALLBACK = [
  { name: 'Mathilde Viot', handle: '@mathild.e_', niche: 'Sport', photo: 'assets/creators/mathilde.jpg' },
  { name: 'Margaux Bekhdadi', handle: '@maybefeelgood_', niche: 'Sport', photo: 'assets/creators/margaux.jpg' },
  { name: 'Candice Maissa', handle: '@candicemaissa', niche: 'Lifestyle', photo: 'assets/creators/candice.jpg' },
  { name: 'Justine Flotte', handle: '@jufrasca__', niche: 'Lifestyle', photo: 'assets/creators/justine.jpg' },
  { name: 'Léna Pasquale', handle: '@lenaa.psl', niche: 'Sport', photo: 'assets/creators/lena.jpg' },
  { name: 'Irina Sambucini', handle: '@irina.smb', niche: 'Lifestyle', photo: 'assets/creators/irina.jpg' },
  { name: 'Lucie Botans', handle: '@lucie.bots', niche: 'Lifestyle', photo: 'assets/creators/lucie.jpg' },
  { name: 'Beverly Filoni', handle: '@beverly.filoni', niche: 'Lifestyle', photo: 'assets/creators/beverly.jpg' },
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
    text: 'Le talent management comme évidence : les créatrices au cœur des marques.',
  },
]
