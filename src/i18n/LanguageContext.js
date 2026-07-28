import { createContext, useContext } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside a <LanguageProvider>');
  }

  return context;
};

export default LanguageContext;
