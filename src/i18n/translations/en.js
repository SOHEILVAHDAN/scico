const en = {
  meta: {
    studio: 'Sahi Studio',
    short: 'Sahi',
    tagline: 'Web & Software Studio',
    switchLabel: 'فارسی',
    switchAria: 'Switch language to Persian',
  },

  nav: {
    home: 'Home',
    about: 'About',
    work: 'Work',
    contact: 'Contact',
    toggleMenu: 'Toggle menu',
  },

  hero: {
    greeting: 'We are Sahi Studio',
    tagline: 'We Build Fast, Scalable Web Products',
    cta: "Let's work together",
  },

  about: {
    intro: {
      title: 'Hi, we’re Sahi Studio',
      text: 'A small, senior team shipping web and software products end to end — from the first wireframe to a production deployment you can rely on.',
    },
    stack: {
      title: 'Our Tech Stack',
      text: 'React, Next.js, TypeScript, Node.js and PostgreSQL are our daily drivers. We pick boring, proven tools so your product stays fast and maintainable.',
    },
    globe: {
      title: 'We work across time zones, with clients worldwide',
      text: 'Based in Tehran, Iran — collaborating remotely with teams in Europe, the Gulf and North America.',
      label: 'Tehran, Iran',
      cta: 'Contact Us',
    },
    passion: {
      title: 'Why teams pick us',
      text: 'We care about the details others skip: performance budgets, accessibility, clean handover docs and code your next developer will thank us for.',
    },
    contact: {
      label: 'Contact us',
      email: 'hello@sahistudio.com',
    },
  },

  projects: {
    heading: 'Our Selected Work',
    live: 'Check Live Site',
    prev: 'Previous project',
    next: 'Next project',
    items: [
      {
        title: 'Nova — Headless Commerce Storefront',
        desc: 'A headless storefront built for a fashion retailer that needed to move off a legacy platform without losing a single SKU. Search, cart and checkout were rebuilt from scratch around a sub-second experience.',
        subdesc:
          'Built with Next.js, TypeScript and a headless commerce API, Nova cut the average page load from 4.2s to 0.9s and lifted mobile conversion by 34%.',
      },
      {
        title: 'Pulse — Real-Time Analytics Dashboard',
        desc: 'An operations dashboard that streams millions of events per day into a single view. Teams can slice live metrics, build alerts and share snapshots without waiting on the data team.',
        subdesc:
          'Powered by React, WebSockets and a ClickHouse backend, Pulse renders 50k+ live data points at a steady 60fps.',
      },
      {
        title: 'Medina — Clinic Management Platform',
        desc: 'A management platform for a network of clinics: patient records, appointment scheduling, SMS reminders and billing, all in one place and fully audit-logged.',
        subdesc:
          'Built with Next.js, Node.js and PostgreSQL, with role-based access control and reminders that cut no-shows by 41%.',
      },
      {
        title: 'Ledger — Fintech Onboarding Flow',
        desc: 'A KYC and onboarding flow for a digital bank. Document capture, identity checks and account setup were reduced to a guided six-step experience that works on any device.',
        subdesc:
          'Built with React, a state-machine driven form engine and a hardened API layer — onboarding drop-off fell from 58% to 19%.',
      },
      {
        title: 'Atlas — AI Knowledge Base',
        desc: 'An internal knowledge base that lets a support team ask questions in plain language and get answers cited straight from their own documentation.',
        subdesc:
          'Built with Next.js, a vector search layer and streaming responses, Atlas now answers 7 of every 10 support tickets before a human sees them.',
      },
    ],
  },

  clients: {
    heading: 'What Our Clients Say',
    items: [
      {
        name: 'Emily Johnson',
        position: 'Marketing Director at GreenLeaf',
        review:
          'Working with Sahi Studio was a genuinely calm experience. They turned our outdated site into a fast, modern platform and explained every decision along the way. The attention to detail is unmatched.',
      },
      {
        name: 'Mark Rogers',
        position: 'Founder of TechGear Shop',
        review:
          'The team delivered a robust, scalable storefront ahead of schedule, and our online sales climbed steadily after launch. They behave like a product partner, not a vendor.',
      },
      {
        name: 'John Dohsas',
        position: 'Project Manager at UrbanTech',
        review:
          'They took a genuinely messy set of requirements and turned it into a clean, functional product. Their problem-solving and communication throughout the project were outstanding.',
      },
      {
        name: 'Esther Smith',
        position: 'CEO of BrightStar Enterprises',
        review:
          'Sahi Studio understood our goals immediately and shipped something better than we had imagined. Strong on both frontend polish and backend reliability.',
      },
    ],
  },

  experience: {
    heading: 'How We Work',
    items: [
      {
        name: 'Discover & Prototype',
        pos: 'Week 1 — 2',
        duration: 'Framer, FigJam',
        title:
          'We start by mapping the problem, not the screens. Interactive prototypes let you click through the real user flow before a single line of production code is written.',
      },
      {
        name: 'Design Systems',
        pos: 'Week 2 — 4',
        duration: 'Figma',
        title:
          'Every project gets a component library and design tokens in Figma, so the interface stays consistent as your product grows and new people join the team.',
      },
      {
        name: 'Build & Handover',
        pos: 'Week 4 — Launch',
        duration: 'Notion, GitHub',
        title:
          'Weekly demos, a public roadmap and documentation your team actually owns. When we hand over, nothing about the project lives only in our heads.',
      },
    ],
  },

  contact: {
    heading: "Let's talk",
    subtitle:
      'Whether you’re starting a new product, rescuing an existing platform, or just need a second opinion on your architecture — we’d love to hear about it.',
    name: 'Full Name',
    namePlaceholder: 'ex., John Doe',
    email: 'Email address',
    emailPlaceholder: 'ex., johndoe@gmail.com',
    message: 'Your message',
    messagePlaceholder: 'Share your project or question...',
    send: 'Send Message',
    sending: 'Sending...',
    success: 'Thank you for your message 😃',
    error: "Your message didn't reach us 😢",
  },

  footer: {
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    rights: '© 2026 Sahi Studio. All rights reserved.',
  },

  alert: {
    success: 'Success',
    failed: 'Failed',
  },

  loading: 'Loading',
};

export default en;
