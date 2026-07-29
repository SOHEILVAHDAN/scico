import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLanguage } from '../i18n/index.js';
import { getProcessSteps } from '../constants/index.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import RevealText from '../components/RevealText.jsx';
import FadeIn from '../components/FadeIn.jsx';
import SectionLabel from '../components/SectionLabel.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pinned stage: the four steps scroll through while a single drawing frame
 * stays put and swaps its contents, so the process reads as one continuous
 * act of drawing rather than four separate cards.
 */
const Process = () => {
  const { t } = useLanguage();
  const steps = getProcessSteps(t);
  const root = useRef(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const stepNodes = gsap.utils.toArray('.process-step');

      if (reduced) {
        gsap.set(stepNodes, { opacity: 1 });
        return;
      }

      stepNodes.forEach((node, index) => {
        ScrollTrigger.create({
          trigger: node,
          start: 'top 60%',
          end: 'bottom 60%',
          onToggle: (self) => self.isActive && setActive(index),
        });

        gsap.fromTo(
          node,
          { opacity: 0.25, x: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: node, start: 'top 75%', end: 'bottom 60%', toggleActions: 'play none none reverse' },
          },
        );
      });

      // Progress rule fills as the stack is read.
      gsap.fromTo(
        '.process-progress_fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: '.process-steps', start: 'top 60%', end: 'bottom 70%', scrub: true },
        },
      );
    },
    { scope: root, dependencies: [reduced, t] },
  );

  return (
    <section ref={root} id="process" className="process-section">
      <div className="process-intro">
        <SectionLabel>{t.process.label}</SectionLabel>

        <RevealText as="h2" className="section-heading">
          {t.process.heading}
        </RevealText>

        <FadeIn y={22} delay={0.1}>
          <p className="section-lead">{t.process.lead}</p>
        </FadeIn>
      </div>

      <div className="process-grid">
        {/* pinned drawing */}
        <div className="process-visual">
          <div className="process-frame">
            {steps.map((step, index) => {
              const Sketch = step.sketch;
              return (
                <div key={step.id} className={`process-frame_layer ${index === active ? 'is-active' : ''}`} aria-hidden="true">
                  <Sketch className="w-full h-full text-line" />
                </div>
              );
            })}

            <div className="process-frame_caption">
              <span>{steps[active]?.number}</span>
              <span>{steps[active]?.name}</span>
            </div>
          </div>
        </div>

        {/* the steps */}
        <ol className="process-steps">
          <div className="process-progress" aria-hidden="true">
            <span className="process-progress_fill" />
          </div>

          {steps.map((step, index) => (
            <li key={step.id} className={`process-step ${index === active ? 'is-active' : ''}`}>
              <div className="process-step_head">
                <span className="process-step_num">{step.number}</span>
                <span className="process-step_duration">{step.duration}</span>
              </div>
              <h3 className="process-step_name">{step.name}</h3>
              <p className="process-step_text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Process;
