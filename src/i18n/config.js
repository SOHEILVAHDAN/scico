import en from './translations/en.js';
import fa from './translations/fa.js';

export const translations = { en, fa };

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', dir: 'ltr' },
  { code: 'fa', label: 'FA', name: 'فارسی', dir: 'rtl' },
];

export const STORAGE_KEY = 'sahi-studio-lang';
export const DEFAULT_LANGUAGE = 'en';

export const getDirection = (code) => (code === 'fa' ? 'rtl' : 'ltr');

/** Resolve the initial language: saved choice → browser language → default. */
export const resolveInitialLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
  } catch {
    /* localStorage may be blocked (private mode) — fall through */
  }

  const browserLang = window.navigator?.language?.slice(0, 2);
  if (browserLang && translations[browserLang]) return browserLang;

  return DEFAULT_LANGUAGE;
};
