import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';

import useAlert from '../hooks/useAlert.js';
import Alert from '../components/Alert.jsx';
import { studioContact } from '../constants/index.js';
import { useLanguage } from '../i18n/index.js';

const Contact = () => {
  const formRef = useRef();
  const { t } = useLanguage();

  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

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
    <section className="c-space my-20" id="contact">
      {alert.show && <Alert {...alert} />}

      <div className="relative min-h-screen flex items-center justify-center flex-col">
        <img src="/assets/terminal.png" alt="" aria-hidden="true" className="absolute inset-0 min-h-screen" />

        <div className="contact-container">
          <h3 className="head-text">{t.contact.heading}</h3>
          <p className="text-lg text-white-600 mt-3">{t.contact.subtitle}</p>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col space-y-7">
            <label className="space-y-3">
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

            <label className="space-y-3">
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

            <label className="space-y-3">
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
              {loading ? t.contact.sending : t.contact.send}

              <img src="/assets/arrow-up.png" alt="" aria-hidden="true" className="field-btn_arrow" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
