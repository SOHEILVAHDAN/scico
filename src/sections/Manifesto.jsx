import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLanguage } from '../i18n/index.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import FadeIn from '../components/FadeIn.jsx';
import SectionLabel from '../components/SectionLabel.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The studio's position, set as a large statement whose lines brighten one by
 * one as they cross the middle of the viewport — the text is read at the pace
 * the scroll sets, not all at once.
 */
const Manifesto = () => {
  const { t } = useLanguage();
  const root = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const lines = gsap.utils.toArray('.manifesto-line');
      if (!lines.length) return;

      if (reduced) {
        gsap.set(lines, { opacity: 1 });
        return;
      }

      gsap.set(lines, { opacity: 0.16 });

      lines.forEach((line) => {
        gsap.to(line, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: line, start: 'top 78%', end: 'top 48%', scrub: true },
        });
      });
    },
    { scope: root, dependencies: [reduced, t] },
  );

  return (
    <section ref={root} className="manifesto-section">
      <SectionLabel>{t.manifesto.label}</SectionLabel>

      <div className="manifesto-grid">
        <h2 className="manifesto-statement">
          {t.manifesto.lines.map((line, i) => (
            <span key={i} className="manifesto-line">
              {line}
            </span>
          ))}
        </h2>

        <div className="manifesto-body">
          {t.manifesto.body.map((paragraph, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <p>{paragraph}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
