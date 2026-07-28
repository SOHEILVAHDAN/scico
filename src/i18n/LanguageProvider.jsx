import { useCallback, useEffect, useMemo, useState } from 'react';

import LanguageContext from './LanguageContext.js';
import { getDirection, resolveInitialLanguage, STORAGE_KEY, translations } from './config.js';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(resolveInitialLanguage);

  const dir = getDirection(language);

  // Keep <html lang/dir> and the document title in sync with the active language.
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.classList.toggle('lang-fa', language === 'fa');

    const { meta } = translations[language];
    document.title = `${meta.studio} — ${meta.tagline}`;

    try {
      window.localStorage?.setItem(STORAGE_KEY, language);
    } catch {
      /* localStorage may be blocked (private mode) — the choice just won't persist */
    }
  }, [language, dir]);

  const setLanguage = useCallback((next) => {
    if (translations[next]) setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'fa' : 'en'));
  }, []);

  const value = useMemo(
    () => ({
      language,
      dir,
      isRTL: dir === 'rtl',
      t: translations[language],
      setLanguage,
      toggleLanguage,
    }),
    [language, dir, setLanguage, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export default LanguageProvider;
