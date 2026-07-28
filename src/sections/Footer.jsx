import { socialLinks } from '../constants/index.js';
import { useLanguage } from '../i18n/index.js';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="c-space pt-7 pb-3 border-t border-black-300 flex justify-between items-center flex-wrap gap-5">
      <div className="text-white-500 flex gap-2">
        <p>{t.footer.terms}</p>
        <p>|</p>
        <p>{t.footer.privacy}</p>
      </div>

      <div className="flex gap-3">
        {socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.name}
            className="social-icon">
            <img src={link.icon} alt="" aria-hidden="true" className="w-1/2 h-1/2" />
          </a>
        ))}
      </div>

      <p className="text-white-500">{t.footer.rights}</p>
    </footer>
  );
};

export default Footer;
