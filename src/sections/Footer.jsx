import { socialLinks } from '../constants/index.js';
import { useLanguage } from '../i18n/index.js';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <p className="footer-name">{t.meta.studio}</p>
          <p className="footer-tagline">{t.footer.tagline}</p>
        </div>

        <ul className="footer-social">
          {socialLinks.map((link) => (
            <li key={link.id}>
              <a href={link.href} target="_blank" rel="noreferrer" className="footer-social_link">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="footer-bottom">
        <p>{t.footer.rights}</p>
        <p>{t.footer.credits}</p>
        <a href="#index" className="footer-top_link">
          {t.footer.backToTop}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
