import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';

import useAlert from '../hooks/useAlert.js';
import Alert from '../components/Alert.jsx';
import { studioContact } from '../constants/index.js';
import { useLanguage } from '../i18n/index.js';
import RevealText from '../components/RevealText.jsx';
import FadeIn from '../components/FadeIn.jsx';
import SectionLabel from '../components/SectionLabel.jsx';

const Contact = () => {
  const formRef = useRef();
  const { t } = useLanguage();

  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = ({ target: { name, value } }) => setForm({ ...form, [name]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: 'Sahi Studio',
          from_email: form.email,
          to_email: studioContact.email,
          message: form.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY,
      )
      .then(
        () => {
          setLoading(false);
          showAlert({ show: true, text: t.contact.success, type: 'success' });
          setTimeout(() => {
            hideAlert(false);
            setForm({ name: '', email: '', message: '' });
          }, 3000);
        },
        (error) => {
          setLoading(false);
          console.error(error);
          showAlert({ show: true, text: t.contact.error, type: 'danger' });
        },
      );
  };

  return (
    <section id="contact" className="contact-section">
      {alert.show && <Alert {...alert} />}

      <SectionLabel>{t.contact.label}</SectionLabel>

      <div className="contact-grid">
        <div className="contact-copy">
          <RevealText as="h2" className="section-heading">
            {t.contact.heading}
          </RevealText>

          <FadeIn y={22} delay={0.08}>
            <p className="section-lead">{t.contact.lead}</p>
          </FadeIn>

          <FadeIn y={20} delay={0.12}>
            <div className="contact-direct">
              <p className="contact-direct_label">{t.contact.directLabel}</p>
              <a href={`mailto:${studioContact.email}`} className="contact-direct_link" dir="ltr">
                {studioContact.email}
              </a>
              <a href={`tel:${studioContact.phone.replace(/\s/g, '')}`} className="contact-direct_link" dir="ltr">
                {studioContact.phone}
              </a>
            </div>
          </FadeIn>

          <FadeIn y={20} delay={0.16}>
            <address className="contact-address">
              <p className="contact-direct_label">{t.contact.studioLabel}</p>
              {t.contact.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </FadeIn>
        </div>

        <FadeIn y={28} className="contact-form_wrap">
          <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
            <label className="field">
              <span className="field-label">{t.contact.name}</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="field-input"
                placeholder={t.contact.namePlaceholder}
              />
            </label>

            <label className="field">
              <span className="field-label">{t.contact.email}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                dir="ltr"
                className="field-input"
                placeholder={t.contact.emailPlaceholder}
              />
            </label>

            <label className="field">
              <span className="field-label">{t.contact.message}</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="field-input"
                placeholder={t.contact.messagePlaceholder}
              />
            </label>

            <button className="field-btn" type="submit" disabled={loading}>
              <span>{loading ? t.contact.sending : t.contact.send}</span>
              <span className="field-btn_rule" aria-hidden="true" />
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
};

export default Contact;
