import { useLanguage } from '../i18n/index.js';
import RevealText from '../components/RevealText.jsx';
import FadeIn from '../components/FadeIn.jsx';
import SectionLabel from '../components/SectionLabel.jsx';
import DrawnSketch from '../components/DrawnSketch.jsx';
import SketchAxo from '../components/sketches/SketchAxo.jsx';

/** Who the studio is, plus the record — kept deliberately plain. */
const Studio = () => {
  const { t } = useLanguage();

  return (
    <section id="studio" className="studio-section">
      <SectionLabel>{t.studio.label}</SectionLabel>

      <div className="studio-grid">
        <div className="studio-copy">
          <RevealText as="h2" className="section-heading">
            {t.studio.heading}
          </RevealText>

          <div className="studio-body">
            {t.studio.body.map((paragraph, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <p>{paragraph}</p>
              </FadeIn>
            ))}
          </div>

          <FadeIn y={24}>
            <dl className="studio-credentials">
              {t.studio.credentials.map((item) => (
                <div key={item.label} className="studio-credential">
                  <dt className="studio-credential_value">{item.value}</dt>
                  <dd className="studio-credential_label">{item.label}</dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>

        <div className="studio-visual">
          <DrawnSketch className="studio-sketch">
            <SketchAxo className="w-full h-auto text-line" />
          </DrawnSketch>
        </div>
      </div>

      <div className="studio-awards">
        <FadeIn y={18}>
          <h3 className="studio-awards_label">{t.studio.awardsLabel}</h3>
        </FadeIn>

        <ul className="award-list">
          {t.studio.awards.map((award, i) => (
            <FadeIn key={`${award.year}-${award.name}`} y={16} delay={i * 0.05}>
              <li className="award">
                <span className="award-year">{award.year}</span>
                <span className="award-name">{award.name}</span>
                <span className="award-detail">{award.detail}</span>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Studio;
