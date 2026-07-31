/* ============================================================
   خانه شماره ۶ — استودیو سَهی | Cinematic Script
   GSAP + ScrollTrigger + Lenis Smooth Scroll
   ============================================================ */

// ---------- LENIS SMOOTH SCROLL ----------
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ---------- REGISTER GSAP PLUGINS ----------
gsap.registerPlugin(ScrollTrigger);

// ---------- LOADING SCREEN ----------
const loader = document.getElementById('loader');
const loaderBar = document.querySelector('.loader-bar');
const loaderCount = document.querySelector('.loader-count');
let loadProgress = 0;

const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 15 + 5;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    setTimeout(() => {
      loader.classList.add('done');
      initHeroAnimation();
    }, 600);
  }
  loaderBar.style.width = loadProgress + '%';
  loaderCount.textContent = Math.floor(loadProgress);
}, 200);

// ---------- HERO ENTRANCE ANIMATION ----------
function initHeroAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Zoom hero background
  gsap.to('.hero-bg', {
    scale: 1,
    duration: 3,
    ease: 'power2.out',
  });

  tl.to('.hero-meta', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.3,
  })
  .to('.hero-title', {
    opacity: 1,
    y: 0,
    duration: 1.2,
  }, '-=0.6')
  .to('.hero-tagline', {
    opacity: 0.85,
    y: 0,
    duration: 1,
  }, '-=0.7')
  .to('.hero-tags', {
    opacity: 1,
    y: 0,
    duration: 0.8,
  }, '-=0.5')
  .to('.hero-scroll-cue', {
    opacity: 0.6,
    duration: 1,
  }, '-=0.3');
}

// Set initial positions for hero elements
gsap.set(['.hero-meta', '.hero-title', '.hero-tagline', '.hero-tags'], {
  y: 40,
});

// ---------- NAVIGATION SCROLL ----------
const nav = document.getElementById('nav');
const navChapterIndicator = document.querySelector('.nav-chapter-indicator');

ScrollTrigger.create({
  trigger: '.hero',
  start: 'bottom top',
  onEnter: () => nav.classList.add('scrolled'),
  onLeaveBack: () => nav.classList.remove('scrolled'),
});

// ---------- PROGRESS BAR ----------
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (scrolled / height) * 100;
  progressBar.style.height = percent + '%';
});

// ---------- PARALLAX HERO ----------
gsap.to('.hero-bg', {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  },
});

// ---------- REVEAL ANIMATIONS ----------
const reveals = document.querySelectorAll('.reveal');
reveals.forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => el.classList.add('active'),
  });
});

const revealImgs = document.querySelectorAll('.reveal-img');
revealImgs.forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => el.classList.add('active'),
  });
});

// ---------- PARALLAX FULLBLEED IMAGES ----------
document.querySelectorAll('.fullbleed img').forEach((img) => {
  gsap.fromTo(img, { yPercent: -15 }, {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: img.closest('.fullbleed'),
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
});

// ---------- CHAPTER ANIMATIONS ----------
document.querySelectorAll('.chapter').forEach((chapter) => {
  const visual = chapter.querySelector('.chapter-visual img');
  const body = chapter.querySelector('.chapter-body');

  // Image parallax
  gsap.fromTo(visual, { scale: 1.1 }, {
    scale: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: chapter,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });

  // Content fade in
  if (body) {
    const elements = body.querySelectorAll('.chapter-num, .chapter-title, .chapter-subtitle, .chapter-desc, .chapter-idea, .chapter-specs');
    gsap.fromTo(elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: body,
          start: 'top 70%',
        },
      }
    );
  }

  // Chapter indicator in nav
  const title = chapter.querySelector('.chapter-title');
  if (title) {
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top 40%',
      end: 'bottom 40%',
      onEnter: () => {
        navChapterIndicator.textContent = title.textContent;
        navChapterIndicator.classList.add('visible');
      },
      onLeave: () => navChapterIndicator.classList.remove('visible'),
      onEnterBack: () => {
        navChapterIndicator.textContent = title.textContent;
        navChapterIndicator.classList.add('visible');
      },
      onLeaveBack: () => navChapterIndicator.classList.remove('visible'),
    });
  }
});

// ---------- LIGHT LAB INTERACTION ----------
const labPreview = document.querySelector('.lab-preview-img');
const labBrightness = document.getElementById('lab-brightness');
const labTemperature = document.getElementById('lab-temperature');
const labContrast = document.getElementById('lab-contrast');
const labBrightnessVal = document.getElementById('lab-brightness-val');
const labTemperatureVal = document.getElementById('lab-temperature-val');
const labContrastVal = document.getElementById('lab-contrast-val');

function updateLabPreview() {
  if (!labPreview) return;
  const brightness = labBrightness ? labBrightness.value : 100;
  const temperature = labTemperature ? labTemperature.value : 50;
  const contrast = labContrast ? labContrast.value : 100;

  // Temperature: 0=warm (sepia), 100=cool (blue)
  const sepia = Math.max(0, 50 - temperature) / 50;
  const hueRotate = (temperature - 50) * 0.4;

  labPreview.style.filter = `
    brightness(${brightness / 100})
    contrast(${contrast / 100})
    sepia(${sepia * 0.5})
    hue-rotate(${hueRotate}deg)
    saturate(${1 + sepia * 0.3})
  `;

  if (labBrightnessVal) labBrightnessVal.textContent = brightness + '%';
  if (labContrastVal) labContrastVal.textContent = contrast + '%';
  if (labTemperatureVal) {
    const kelvin = Math.round(2700 + (temperature / 100) * 2300);
    labTemperatureVal.textContent = kelvin + 'K';
  }
}

[labBrightness, labTemperature, labContrast].forEach(input => {
  if (input) input.addEventListener('input', updateLabPreview);
});

// ---------- MATERIAL LAB BUTTONS ----------
document.querySelectorAll('.lab-mat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lab-mat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ---------- CONTEXT CARDS STAGGER ----------
gsap.fromTo('.context-card',
  { opacity: 0, y: 40 },
  {
    opacity: 1,
    y: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.context-grid',
      start: 'top 75%',
    },
  }
);

// ---------- MATERIAL ORBS ----------
gsap.fromTo('.material-card',
  { opacity: 0, y: 30, scale: 0.9 },
  {
    opacity: 1,
    y: 0,
    scale: 1,
    stagger: 0.1,
    duration: 0.8,
    ease: 'back.out(1.2)',
    scrollTrigger: {
      trigger: '.materials-grid',
      start: 'top 75%',
    },
  }
);

// ---------- LIGHT LAYERS ----------
gsap.fromTo('.light-layer-card',
  { opacity: 0, y: 40 },
  {
    opacity: 1,
    y: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.light-layers',
      start: 'top 75%',
    },
  }
);

// ---------- TIMELINE STEPS ----------
document.querySelectorAll('.timeline-step').forEach((step, i) => {
  gsap.fromTo(step,
    { opacity: 0, x: 30 },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: step,
        start: 'top 80%',
      },
    }
  );
});

// ---------- SUSTAINABILITY CARDS ----------
gsap.fromTo('.sustain-card',
  { opacity: 0, y: 30 },
  {
    opacity: 1,
    y: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.sustain-grid',
      start: 'top 75%',
    },
  }
);

// ---------- SKETCH CARDS ----------
gsap.fromTo('.sketch-card',
  { opacity: 0, y: 40 },
  {
    opacity: 1,
    y: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.sketches-grid',
      start: 'top 75%',
    },
  }
);

// ---------- CONCLUSION ----------
gsap.fromTo('.conclusion-quote',
  { opacity: 0, y: 50, scale: 0.97 },
  {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.5,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.conclusion',
      start: 'top 60%',
    },
  }
);

// ---------- CONCEPT IMAGE REVEAL ----------
gsap.fromTo('.concept-image',
  { clipPath: 'inset(100% 0 0 0)' },
  {
    clipPath: 'inset(0% 0 0 0)',
    duration: 1.5,
    ease: 'power3.inOut',
    scrollTrigger: {
      trigger: '.concept-split',
      start: 'top 65%',
    },
  }
);

gsap.fromTo('.concept-point',
  { opacity: 0, x: 40 },
  {
    opacity: 1,
    x: 0,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.concept-points',
      start: 'top 70%',
    },
  }
);

// ---------- SMOOTH ANCHOR LINKS ----------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, { offset: -60, duration: 1.5 });
    }
  });
});

// ---------- MOUSE PARALLAX ON HERO ----------
const heroContent = document.querySelector('.hero-content');
document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
  const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
  const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
  gsap.to(heroContent, {
    x: xPercent * -10,
    y: yPercent * -8,
    duration: 1,
    ease: 'power2.out',
  });
  gsap.to('.hero-bg', {
    x: xPercent * 15,
    y: yPercent * 10,
    duration: 1.5,
    ease: 'power2.out',
  });
});

// ---------- REFRESH ON RESIZE ----------
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});
