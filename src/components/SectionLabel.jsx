import FadeIn from './FadeIn.jsx';

/** Small ruled caption that marks the start of a section, like a sheet title. */
const SectionLabel = ({ children, className = '' }) => (
  <FadeIn y={18} className={`section-label ${className}`}>
    <span className="section-label_rule" aria-hidden="true" />
    <span className="section-label_text">{children}</span>
  </FadeIn>
);

export default SectionLabel;
