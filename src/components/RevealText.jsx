import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import useReducedMotion from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Line-by-line masked reveal — the type rises out of its own baseline.
 *
 * Splitting is done on whole words wrapped in overflow-hidden rows rather than
 * per character, which keeps Persian shaping and ligatures intact (a per-glyph
 * split would break connected script).
 */
const RevealText = ({ as: Tag = 'p', children, className = '', delay = 0, stagger = 0.08, y = '110%' }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const lines = gsap.utils.toArray(ref.current?.querySelectorAll('.reveal-line') ?? []);
      if (!lines.length) return;

      if (reduced) {
        gsap.set(lines, { yPercent: 0, opacity: 1 });
        return;
      }

      gsap.fromTo(
        lines,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          delay,
          stagger,
          ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced, delay, stagger, children] },
  );

  const lines = Array.isArray(children) ? children : [children];

  return (
    <Tag ref={ref} className={className} style={{ '--reveal-y': y }}>
      {lines.map((line, index) => (
        <span key={index} className="reveal-mask">
          <span className="reveal-line">{line}</span>
        </span>
      ))}
    </Tag>
  );
};

export default RevealText;
