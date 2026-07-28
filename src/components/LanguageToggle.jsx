import { useLanguage } from '../i18n/index.js';

const LanguageToggle = ({ className = '' }) => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t.meta.switchAria}
      title={t.meta.switchAria}
      className={`lang-toggle ${className}`}>
      <img src="/assets/globe.svg" alt="" aria-hidden="true" className="w-4 h-4 opacity-70" />
      <span className={language === 'en' ? 'font-generalsans' : ''}>{t.meta.switchLabel}</span>
    </button>
  );
};

export default LanguageToggle;
