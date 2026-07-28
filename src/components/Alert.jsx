import { useLanguage } from '../i18n/index.js';

const Alert = ({ type, text }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-5 ltr:right-5 rtl:left-5 flex justify-center items-center z-50">
      <div
        className={`${
          type === 'danger' ? 'bg-red-800' : 'bg-blue-800'
        } items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex rounded-md p-5`}
        role="alert">
        <p
          className={`flex rounded-full ${
            type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
          } uppercase px-2 py-1 text-xs font-semibold ltr:mr-3 rtl:ml-3`}>
          {type === 'danger' ? t.alert.failed : t.alert.success}
        </p>
        <p className="ltr:mr-2 rtl:ml-2 ltr:text-left rtl:text-right">{text}</p>
      </div>
    </div>
  );
};

export default Alert;
