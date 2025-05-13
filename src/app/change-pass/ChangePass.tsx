'use client';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAppSelector, selectLanguage, selectUser } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

const ChangePass = () => {
  const userData = useAppSelector(selectUser);
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.changepass.title' });
  }, [locale]);

  return (
    <div>
      <Header />

      <Footer />
    </div>
  );
};

export default ChangePass;
