import { useLanguage } from '../i18n/index.js';

const LanguageToggle = ({ className = '' }) => {
  const { t, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t.meta.switchAria}
      title={t.meta.switchAria}
      className={`lang-toggle ${className}`}>
      {t.meta.switchLabel}
    </button>
  );
};

export default LanguageToggle;
