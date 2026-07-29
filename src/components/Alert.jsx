import { useLanguage } from '../i18n/index.js';

const Alert = ({ type, text }) => {
  const { t } = useLanguage();

  return (
    <div className={`alert alert--${type === 'danger' ? 'danger' : 'success'}`} role="alert">
      <span className="alert-tag">{type === 'danger' ? t.alert.failed : t.alert.success}</span>
      <span className="alert-text">{text}</span>
    </div>
  );
};

export default Alert;
