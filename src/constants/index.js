/**
 * Static, language independent data (assets, styles, layout math).
 * All user facing copy lives in `src/i18n/translations/*` and is merged in
 * by the helpers below, so adding a language never means touching this file.
 */

export const navLinks = [
  { id: 1, key: 'home', href: '#home' },
  { id: 2, key: 'about', href: '#about' },
  { id: 3, key: 'work', href: '#work' },
  { id: 4, key: 'contact', href: '#contact' },
];

export const socialLinks = [
  { id: 1, name: 'GitHub', href: 'https://github.com/sahistudio', icon: '/assets/github.svg' },
  { id: 2, name: 'X', href: 'https://x.com/sahistudio', icon: '/assets/twitter.svg' },
  { id: 3, name: 'Instagram', href: 'https://instagram.com/sahistudio', icon: '/assets/instagram.svg' },
];

export const studioContact = {
  email: 'hello@sahistudio.com',
  location: { lat: 35.6892, lng: 51.389 },
};

const projectAssets = [
  {
    id: 'nova',
    href: 'https://github.com/sahistudio',
    texture: '/textures/project/project1.mp4',
    logo: '/assets/project-logo1.png',
    logoStyle: {
      backgroundColor: '#2A1816',
      border: '0.2px solid #36201D',
      boxShadow: '0px 0px 60px 0px #AA3C304D',
    },
    spotlight: '/assets/spotlight1.png',
    tags: [
      { id: 1, name: 'React.js', path: '/assets/react.svg' },
      { id: 2, name: 'TailwindCSS', path: '/assets/tailwindcss.png' },
      { id: 3, name: 'TypeScript', path: '/assets/typescript.png' },
      { id: 4, name: 'Framer Motion', path: '/assets/framer.png' },
    ],
  },
  {
    id: 'pulse',
    href: 'https://github.com/sahistudio',
    texture: '/textures/project/project2.mp4',
    logo: '/assets/project-logo2.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px #2F6DB54D',
    },
    spotlight: '/assets/spotlight2.png',
    tags: [
      { id: 1, name: 'React.js', path: '/assets/react.svg' },
      { id: 2, name: 'TailwindCSS', path: '/assets/tailwindcss.png' },
      { id: 3, name: 'TypeScript', path: '/assets/typescript.png' },
      { id: 4, name: 'Framer Motion', path: '/assets/framer.png' },
    ],
  },
  {
    id: 'medina',
    href: 'https://github.com/sahistudio',
    texture: '/textures/project/project3.mp4',
    logo: '/assets/project-logo3.png',
    logoStyle: {
      backgroundColor: '#60f5a1',
      background:
        'linear-gradient(0deg, #60F5A150, #60F5A150), linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(208, 213, 221, 0.8) 100%)',
      border: '0.2px solid rgba(208, 213, 221, 1)',
      boxShadow: '0px 0px 60px 0px rgba(35, 131, 96, 0.3)',
    },
    spotlight: '/assets/spotlight3.png',
    tags: [
      { id: 1, name: 'React.js', path: '/assets/react.svg' },
      { id: 2, name: 'TailwindCSS', path: '/assets/tailwindcss.png' },
      { id: 3, name: 'TypeScript', path: '/assets/typescript.png' },
      { id: 4, name: 'Framer Motion', path: '/assets/framer.png' },
    ],
  },
  {
    id: 'ledger',
    href: 'https://github.com/sahistudio',
    texture: '/textures/project/project4.mp4',
    logo: '/assets/project-logo4.png',
    logoStyle: {
      backgroundColor: '#0E1F38',
      border: '0.2px solid #0E2D58',
      boxShadow: '0px 0px 60px 0px #2F67B64D',
    },
    spotlight: '/assets/spotlight4.png',
    tags: [
      { id: 1, name: 'React.js', path: '/assets/react.svg' },
      { id: 2, name: 'TailwindCSS', path: '/assets/tailwindcss.png' },
      { id: 3, name: 'TypeScript', path: '/assets/typescript.png' },
      { id: 4, name: 'Framer Motion', path: '/assets/framer.png' },
    ],
  },
  {
    id: 'atlas',
    href: 'https://github.com/sahistudio',
    texture: '/textures/project/project5.mp4',
    logo: '/assets/project-logo5.png',
    logoStyle: {
      backgroundColor: '#1C1A43',
      border: '0.2px solid #252262',
      boxShadow: '0px 0px 60px 0px #635BFF4D',
    },
    spotlight: '/assets/spotlight5.png',
    tags: [
      { id: 1, name: 'React.js', path: '/assets/react.svg' },
      { id: 2, name: 'TailwindCSS', path: '/assets/tailwindcss.png' },
      { id: 3, name: 'TypeScript', path: '/assets/typescript.png' },
      { id: 4, name: 'Framer Motion', path: '/assets/framer.png' },
    ],
  },
];

const reviewAssets = [
  { id: 1, img: '/assets/review1.png' },
  { id: 2, img: '/assets/review2.png' },
  { id: 3, img: '/assets/review3.png' },
  { id: 4, img: '/assets/review4.png' },
];

const workflowAssets = [
  { id: 1, icon: '/assets/framer.svg', animation: 'victory' },
  { id: 2, icon: '/assets/figma.svg', animation: 'clapping' },
  { id: 3, icon: '/assets/notion.svg', animation: 'salute' },
];

/** Merge translated copy with the static asset definitions above. */
const zip = (assets, copy = []) => assets.map((asset, index) => ({ ...asset, ...(copy[index] ?? {}) }));

export const getProjects = (t) => zip(projectAssets, t.projects.items);
export const getClientReviews = (t) => zip(reviewAssets, t.clients.items);
export const getWorkExperiences = (t) => zip(workflowAssets, t.experience.items);

export const calculateSizes = (isSmall, isMobile, isTablet) => {
  return {
    deskScale: isSmall ? 0.05 : isMobile ? 0.06 : 0.065,
    deskPosition: isMobile ? [0.5, -4.5, 0] : [0.25, -5.5, 0],
    cubePosition: isSmall ? [4, -5, 0] : isMobile ? [5, -5, 0] : isTablet ? [5, -5, 0] : [9, -5.5, 0],
    reactLogoPosition: isSmall ? [3, 4, 0] : isMobile ? [5, 4, 0] : isTablet ? [5, 4, 0] : [12, 3, 0],
    ringPosition: isSmall ? [-5, 7, 0] : isMobile ? [-10, 10, 0] : isTablet ? [-12, 10, 0] : [-24, 10, 0],
    targetPosition: isSmall ? [-5, -10, -10] : isMobile ? [-9, -10, -10] : isTablet ? [-11, -7, -10] : [-13, -13, -10],
  };
};
