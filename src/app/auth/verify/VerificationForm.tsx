'use client';
import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useAppSelector, selectLanguage } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import request from '@/lib/axios';
import Loading from '@/app/components/Loading';

const VerificationForm = ({ email }: { email: string }) => {
  const [code, setCode] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.verify.title' });
  }, [locale]);

  const handleVerify = async () => {
    setLoading(true);
    setResendMessage('');
    const response = await request.post('/be/auth/verify', { email, code });

    if (response.data.error_msg) {
      setErrMessage(response.data.error_msg);
      setLoading(false);
      return;
    }

    if (response.data.status === 'success') {
      window.location.href = '/';
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setErrMessage('');
    const response = await request.get(
      `/be/auth/verify/${encodeURIComponent(email)}`
    );
    if (response.data.status === 'verify') {
      setResendMessage('verify.resendSuccess');
    }
    setLoading(false);
  };

  return (
    <div>
      <Header />
      <div className="flex items-start min-h-screen justify-center bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {intl.formatMessage({ id: 'verify.title' })}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {intl.formatMessage({ id: 'verify.subtitle' })}{' '}
              <span className="text-indigo-600">"{email}"</span>
            </p>
          </div>

          <div className="text-red-600 text-sm text-center">
            {errMessage && intl.formatMessage({ id: errMessage })}
          </div>
          <div className="text-green-600 text-sm text-center">
            {resendMessage && intl.formatMessage({ id: resendMessage })}
          </div>

          <form className="mt-8 space-y-6">
            <input type="hidden" name="email" value={email} />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="code" className="sr-only">
                  {intl.formatMessage({ id: 'verify.code' })}
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={intl.formatMessage({ id: 'verify.placeholder' })}
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleVerify}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {intl.formatMessage({ id: 'verify.button' })}
              </button>
            </div>
          </form>

          <div className="text-sm text-center mt-4">
            <button
              className="font-medium text-indigo-600 hover:text-indigo-500"
              onClick={handleResend}
            >
              {intl.formatMessage({ id: 'verify.resend' })}
            </button>
          </div>
        </div>
      </div>
      <Footer />
      {loading && (
        <div className="fixed inset-0 z-10 bg-gray-200 bg-opacity-75 flex items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default VerificationForm;
