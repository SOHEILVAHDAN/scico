import { useEffect, useRef, useState } from 'react';

import { navLinks } from '../constants/index.js';
import { useLanguage } from '../i18n/index.js';
import LanguageToggle from '../components/LanguageToggle.jsx';

/**
 * Thin rule at the top of the page with a scroll-progress line under it.
 * Hides on scroll down, returns on scroll up, so the drawings are never
 * competing with chrome.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 240 && y > lastY.current);
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !isOpen ? 'is-hidden' : ''}`}>
      <div className="nav-inner">
        <a href="#index" className="nav-brand" onClick={closeMenu}>
          <span className="nav-brand_mark" aria-hidden="true" />
          <span className="nav-brand_name">{t.meta.short}</span>
          <span className="nav-brand_role">{t.meta.tagline}</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((item) => (
            <a key={item.id} href={item.href} className="nav-link">
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <LanguageToggle />

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="nav-burger"
            aria-label={t.nav.toggleMenu}
            aria-expanded={isOpen}>
            <span className={`nav-burger_bar ${isOpen ? 'is-open-top' : ''}`} />
            <span className={`nav-burger_bar ${isOpen ? 'is-open-bottom' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`nav-sheet ${isOpen ? 'is-open' : ''}`}>
        {navLinks.map((item) => (
          <a key={item.id} href={item.href} className="nav-sheet_link" onClick={closeMenu}>
            <span className="nav-sheet_index">{String(item.id).padStart(2, '0')}</span>
            {t.nav[item.key]}
          </a>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
