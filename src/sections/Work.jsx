import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLanguage } from '../i18n/index.js';
import { getProjects } from '../constants/index.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import DrawnSketch from '../components/DrawnSketch.jsx';
import RevealText from '../components/RevealText.jsx';
import FadeIn from '../components/FadeIn.jsx';
import SectionLabel from '../components/SectionLabel.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * One project per screen. The drawing pins to the side and draws itself as the
 * written argument scrolls past it, so the visitor reads the reasoning and
 * watches the plan appear at the same time — which is the whole point.
 */
const ProjectEntry = ({ project, isLast }) => {
  const { t } = useLanguage();
  const root = useRef(null);
  const reduced = useReducedMotion();
  const Sketch = project.sketch;

  useGSAP(
    () => {
      if (reduced) return;

      const media = window.matchMedia('(min-width: 1024px)');
      if (!media.matches) return;

      // Slow counter-drift on the pinned drawing keeps the frame alive.
      gsap.fromTo(
        root.current.querySelector('.project-plate'),
        { yPercent: -2 },
        {
          yPercent: 2,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  const fields = [
    [t.work.fields.location, project.location],
    [t.work.fields.year, project.year],
    [t.work.fields.type, project.type],
    [t.work.fields.area, project.area],
    [t.work.fields.status, project.status],
  ];

  return (
    <article ref={root} className={`project ${isLast ? 'project--last' : ''}`}>
      {/* --- the drawing, pinned --- */}
      <div className="project-visual">
        <div className="project-plate">
          <DrawnSketch className="project-sketch">
            <Sketch className="w-full h-auto text-line" />
          </DrawnSketch>

          <div className="project-plate_caption">
            <span>{project.sheet}</span>
            <span>{project.scale}</span>
          </div>
        </div>
      </div>

      {/* --- the argument, scrolling --- */}
      <div className="project-body">
        <FadeIn y={16}>
          <span className="project-index">{project.index}</span>
        </FadeIn>

        <RevealText as="h3" className="project-title">
          {project.title}
        </RevealText>

        <FadeIn y={20} delay={0.05}>
          <p className="project-subtitle">{project.subtitle}</p>
        </FadeIn>

        <FadeIn y={20} delay={0.08}>
          <dl className="project-facts">
            {fields.map(([label, value]) => (
              <div key={label} className="project-fact">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>

        <FadeIn y={24} delay={0.05}>
          <p className="project-thesis">{project.thesis}</p>
        </FadeIn>

        <ol className="project-moves">
          {project.moves.map((move, i) => (
            <FadeIn key={i} y={18} delay={i * 0.06}>
              <li className="project-move">
                <span className="project-move_num">{String(i + 1).padStart(2, '0')}</span>
                <span className="project-move_text">{move}</span>
              </li>
            </FadeIn>
          ))}
        </ol>

        <FadeIn y={20}>
          <p className="project-detail">{project.detail}</p>
        </FadeIn>
      </div>
    </article>
  );
};

const Work = () => {
  const { t } = useLanguage();
  const projects = getProjects(t);

  return (
    <section id="work" className="work-section">
      <div className="work-intro">
        <SectionLabel>{t.work.label}</SectionLabel>

        <RevealText as="h2" className="section-heading">
          {t.work.heading}
        </RevealText>

        <FadeIn y={22} delay={0.1}>
          <p className="section-lead">{t.work.lead}</p>
        </FadeIn>
      </div>

      <div className="work-list">
        {projects.map((project, i) => (
          <ProjectEntry key={project.id} project={project} isLast={i === projects.length - 1} />
        ))}
      </div>
    </section>
  );
};

export default Work;
