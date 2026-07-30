/* Animation system: progressive enhancement; content stays readable if CDN libraries are unavailable. */
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  setTimeout(() => loader.classList.add('is-gone'), 700);
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = window.Lenis ? new Lenis({ lerp: .09, smoothWheel: true }) : null;
  if (lenis) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }

  gsap.from('.hero-copy > *', { y: 45, opacity: 0, stagger: .12, delay: .25, duration: 1.15, ease: 'power3.out' });
  gsap.from('.hero-foot', { opacity: 0, delay: 1, duration: .8 });
  gsap.to('.progress span', { height: '100%', ease: 'none', scrollTrigger: { scrub: .2, start: 'top top', end: 'bottom bottom' } });
  document.querySelectorAll('.reveal, .chapter-head, .concept-top, .light-copy, .systems-grid, .experience-grid').forEach(el => {
    gsap.from(el, { y: 45, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.from('.evo-step', { y: 50, opacity: 0, stagger: .12, scrollTrigger: { trigger: '.evolution', start: 'top 80%' } });
  gsap.to('.climate-orbit', { rotation: 12, ease: 'none', scrollTrigger: { trigger: '.context', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.sun-disc', { xPercent: 70, yPercent: 35, ease: 'none', scrollTrigger: { trigger: '.light', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.slats', { xPercent: 15, ease: 'none', scrollTrigger: { trigger: '.light', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.gallery-track', { x: () => -(document.querySelector('.gallery-track').scrollWidth - innerWidth + 50), ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top 72%', end: 'bottom top', scrub: 1 } });
  const heroVideo = document.querySelector('.hero-video');
  gsap.to(heroVideo, { scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
});

// Interactive evolution diagram: stages selectively reveal the graphic logic.
const stages = {
  sketch: ['.sketch'], massing: ['.massing'], carve: ['.massing', '.carve'], flow: ['.massing', '.carve', '.flow']
};
const labels = {
  sketch: 'The plan begins as a precise line between shelter and openness.',
  massing: 'A simple perimeter becomes a set of measured volumes around an empty centre.',
  carve: 'Cuts bring weather into the composition and pull programme toward the court.',
  flow: 'A looped promenade lets daily life move continuously between interior and landscape.'
};
document.querySelectorAll('.timeline-item').forEach(button => button.addEventListener('click', () => {
  const stage = button.dataset.stage;
  document.querySelectorAll('.timeline-item').forEach(b => b.classList.toggle('is-active', b === button));
  document.querySelectorAll('.draw:not(.base)').forEach(path => { path.style.opacity = stages[stage].includes('.' + path.classList[1]) ? 1 : 0; });
  document.getElementById('stageText').textContent = labels[stage];
  if (window.gsap) gsap.fromTo(stages[stage].map(s => '#planDrawing ' + s).join(','), { strokeDasharray: 900, strokeDashoffset: 900 }, { strokeDashoffset: 0, duration: .8, stagger: .12, ease: 'power2.out' });
}));

// Keep a minimal editorial cursor on pointer devices.
const cursor = document.querySelector('.cursor-dot');
window.addEventListener('pointermove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });
document.querySelectorAll('a,button').forEach(el => { el.addEventListener('mouseenter', () => cursor.style.cssText += ';width:26px;height:26px'); el.addEventListener('mouseleave', () => cursor.style.cssText += ';width:10px;height:10px'); });

// The reveal button controls the same supplied film, avoiding a duplicated playback stream.
document.querySelector('.play').addEventListener('click', () => { const v = document.querySelector('.final-video'); v.play(); v.setAttribute('controls', ''); document.querySelector('.final-overlay').style.opacity = 0; });
