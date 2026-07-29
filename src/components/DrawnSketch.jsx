import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import useReducedMotion from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Draws an SVG sketch on as it scrolls into view.
 *
 * Each path is measured, then dashed with its own length so animating
 * `stroke-dashoffset` from full length to zero reads as a pen laying the line
 * down. Layers (.sk-grid → .sk-walls → .sk-openings → .sk-dims) are staggered
 * in that order, so the drawing builds the way it would be drawn by hand:
 * setting-out first, structure next, annotation last.
 *
 * `scrub` ties the whole thing to scroll position, so the visitor is drawing
 * it themselves; text elements can't be dashed, so they fade instead.
 */
const LAYER_ORDER = ['.sk-grid', '.sk-walls', '.sk-openings', '.sk-dims'];

const DrawnSketch = ({ children, className = '', scrub = true, start = 'top 85%', end = 'bottom 55%' }) => {
  const container = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const svg = container.current?.querySelector('svg');
      if (!svg) return;

      const texts = gsap.utils.toArray(svg.querySelectorAll('text'));

      if (reduced) {
        gsap.set([...gsap.utils.toArray(svg.querySelectorAll('path, line, circle')), ...texts], { opacity: 1 });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start,
          end,
          scrub: scrub ? 1 : false,
          once: !scrub,
        },
      });

      LAYER_ORDER.forEach((selector, layerIndex) => {
        const strokes = gsap.utils.toArray(svg.querySelectorAll(`${selector} path, ${selector} line, ${selector} circle`));
        if (!strokes.length) return;

        strokes.forEach((node) => {
          // Circles report 0 from getTotalLength in some engines — fall back to circumference.
          const length =
            typeof node.getTotalLength === 'function' && node.getTotalLength() > 0
              ? node.getTotalLength()
              : 2 * Math.PI * (Number(node.getAttribute('r')) || 10);

          gsap.set(node, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
        });

        timeline.to(
          strokes,
          {
            strokeDashoffset: 0,
            duration: 1,
            ease: 'none',
            stagger: { each: 0.012, from: 'start' },
          },
          layerIndex * 0.55,
        );
      });

      if (texts.length) {
        gsap.set(texts, { opacity: 0 });
        timeline.to(texts, { opacity: 1, duration: 0.5, stagger: 0.03, ease: 'power1.out' }, LAYER_ORDER.length * 0.5);
      }
    },
    { scope: container, dependencies: [reduced, scrub, start, end] },
  );

  return (
    <div ref={container} className={`sketch-frame ${className}`}>
      {children}
    </div>
  );
};

export default DrawnSketch;
