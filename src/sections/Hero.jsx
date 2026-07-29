import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLanguage } from '../i18n/index.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import SketchConcept from '../components/sketches/SketchConcept.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Opening frame: the concept sketch draws itself unprompted, the title rises
 * out of its baseline, and the whole plate drifts away on a parallax as the
 * visitor scrolls into the manifesto.
 */
const Hero = () => {
  const { t } = useLanguage();
  const root = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const svg = root.current.querySelector('.hero-sketch svg');

      if (reduced) {
        gsap.set('.hero-line, .hero-eyebrow, .hero-lead, .hero-stat, .hero-scroll', { opacity: 1, yPercent: 0, y: 0 });
        if (svg) gsap.set(svg.querySelectorAll('path, line, circle, text'), { opacity: 1 });
        return;
      }

      /* --- the sketch draws itself on load, slowly --- */
      if (svg) {
        const strokes = gsap.utils.toArray(svg.querySelectorAll('path, line, circle'));
        strokes.forEach((node) => {
          const length =
            typeof node.getTotalLength === 'function' && node.getTotalLength() > 0
              ? node.getTotalLength()
              : 2 * Math.PI * (Number(node.getAttribute('r')) || 10);
          gsap.set(node, { strokeDasharray: length, strokeDashoffset: length });
        });

        gsap.set(svg.querySelectorAll('text'), { opacity: 0 });

        gsap
          .timeline({ delay: 0.35 })
          .to(strokes, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.012 })
          .to(svg.querySelectorAll('text'), { opacity: 1, duration: 0.6, stagger: 0.05 }, '-=0.9');
      }

      /* --- title and supporting copy --- */
      gsap
        .timeline({ delay: 0.15 })
        .fromTo('.hero-eyebrow', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
        .fromTo(
          '.hero-line',
          { yPercent: 118, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.11, ease: 'expo.out' },
          '-=0.7',
        )
        .fromTo('.hero-lead', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.9')
        .fromTo(
          '.hero-stat',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out' },
          '-=0.8',
        )
        .fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.5');

      /* --- parallax exit --- */
      gsap.to('.hero-copy', {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      gsap.to('.hero-sketch', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: root, dependencies: [reduced, t] },
  );

  return (
    <section ref={root} id="index" className="hero-section">
      {/* the drawing sits behind everything, oversized and cropped */}
      <div className="hero-sketch" aria-hidden="true">
        <SketchConcept className="w-full h-full text-line" />
      </div>

      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-copy">
        <p className="hero-eyebrow">{t.hero.eyebrow}</p>

        <h1 className="hero-title">
          {t.hero.lines.map((line, i) => (
            <span key={i} className="reveal-mask">
              <span className="hero-line">{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero-lead">{t.hero.lead}</p>

        <dl className="hero-stats">
          {t.hero.stats.map((stat) => (
            <div key={stat.label} className="hero-stat">
              <dt className="hero-stat_value">{stat.value}</dt>
              <dd className="hero-stat_label">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <span className="hero-scroll_label">{t.hero.scroll}</span>
        <span className="hero-scroll_rule" />
      </div>
    </section>
  );
};

export default Hero;
