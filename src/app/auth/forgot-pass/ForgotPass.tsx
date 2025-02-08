'use client';
import '@/app/scss/ForgotPass.scss';
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Loading from '@/app/components/Loading';
import { useAppSelector, selectLanguage } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

function ForgotPass() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.forgot-pass.title' });
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      setMessage({
        type: 'success',
        text: 'forgot-pass.success',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'forgot-pass.error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <Header />
      <main className="forgot-password-main">
        <div className="forgot-password-card">
          <h1 className="title">
            {intl.formatMessage({ id: 'forgot-pass.title' })}
          </h1>
          <p className="description">
            {intl.formatMessage({ id: 'forgot-pass.description' })}
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">
                {intl.formatMessage({ id: 'forgot-pass.email.label' })}
              </label>
              <input
                className="form-input"
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={intl.formatMessage({
                  id: 'forgot-pass.email.placeholder',
                })}
                required
              />
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {intl.formatMessage({ id: message.text })}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {intl.formatMessage({ id: 'forgot-pass.submit' })}
            </button>

            <a href="/auth/login" className="back-to-login">
              {intl.formatMessage({ id: 'forgot-pass.back' })}
            </a>
          </form>
        </div>
      </main>
      <Footer />
      {isLoading && (
        <div className="loading-animation">
          <Loading />
        </div>
      )}
    </div>
  );
}

export default ForgotPass;
