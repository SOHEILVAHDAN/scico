import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import useReducedMotion from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Quiet entrance for blocks that shouldn't compete with the sketches. */
const FadeIn = ({ children, className = '', y = 34, delay = 0, duration = 1, start = 'top 88%' }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start, once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced, y, delay, duration, start] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default FadeIn;
