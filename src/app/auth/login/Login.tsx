'use client';
import '@/app/scss/Login.scss';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BsGoogle } from 'react-icons/bs';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Loading from '@/app/components/Loading';
import { FormattedMessage } from 'react-intl';
import {
  useAppSelector,
  useAppDispatch,
  selectLanguage,
  selectError,
  clearError,
  setError,
} from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import request from '@/lib/axios';

type ErrorMessage = {
  param: string;
  msg: string;
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPass, setIsShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [errMessage, setErrMessage] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const error = useAppSelector(selectError);
  const dispatch = useAppDispatch();

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.login.title' });
    dispatch(setError(searchParams.get('error')));
  }, [locale]);

  const handleLogin = async () => {
    setLoading(true);
    setErrors([]);
    setErrMessage('');
    dispatch(clearError());

    const data = {
      email,
      password,
    };

    const response = await request.post('/be/auth/login', data);
    if (response.data.error_msg) {
      setErrMessage(response.data.error_msg);
    }

    if (response.data.errors) {
      setErrors(response.data.errors);
    }

    if (response.data.status === 'verify') {
      router.push(`/auth/verify/${encodeURIComponent(email)}`);
    }

    if (response.data.status === 'success') {
      router.push('/');
    }

    setLoading(false);
  };

  return (
    <>
      <div className="main">
        <Header />
        <div className="login-container">
          <div className="login-content">
            <div className="login-inner">
              <div className="login-title">
                <FormattedMessage id="login.title" />
              </div>
              {error && (
                <div className="warning text-center mb-3">
                  <FormattedMessage id={error} />
                </div>
              )}
              <div className="text-red-500 text-sm text-center mb-3">
                {errMessage && intl.formatMessage({ id: errMessage })}
              </div>
              <div className="login-form">
                <div className="login-field">
                  <div className="login-row">
                    <label className="login-label">
                      <FormattedMessage id="login.email" />{' '}
                    </label>
                    <span className="musthave">*</span>
                    <FormattedMessage id="login.placeholderemail">
                      {placeholder => (
                        <input
                          type="text"
                          className="login-input"
                          placeholder={placeholder.toString()}
                          onChange={e => setEmail(e.target.value)}
                        />
                      )}
                    </FormattedMessage>
                    {errors.map(error => {
                      if (error.param === 'email') {
                        return (
                          <div
                            key={error.param}
                            className="text-red-500 text-sm pt-1"
                          >
                            {intl.formatMessage({ id: error.msg })}
                          </div>
                        );
                      }
                    })}
                  </div>
                  <div className="login-row">
                    <label className="login-label">
                      <FormattedMessage id="login.password" />
                    </label>
                    <span className="musthave">*</span>
                    <FormattedMessage id="login.placeholderpassword">
                      {placeholder => (
                        <input
                          id="password"
                          type={isShowPass ? 'text' : 'password'}
                          className="login-input"
                          placeholder={placeholder.toString()}
                          onChange={e => setPassword(e.target.value)}
                        />
                      )}
                    </FormattedMessage>
                    {errors.map(error => {
                      if (error.param === 'password') {
                        return (
                          <div
                            key={error.param}
                            className="text-red-500 text-sm pt-1"
                          >
                            {intl.formatMessage({ id: error.msg })}
                          </div>
                        );
                      }
                    })}
                    <div className="py-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="show-password"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 cursor-pointer"
                          checked={isShowPass}
                          onChange={e => setIsShowPass(e.target.checked)}
                        />
                        <label
                          htmlFor="show-password"
                          className="pt-1 ml-2 text-sm text-gray-600"
                        >
                          <FormattedMessage id="login.showpassword" />
                        </label>
                      </div>
                      <a
                        href="/forgot-pass"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        <FormattedMessage id="login.forgotpassword" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="login-button">
                <button
                  type="submit"
                  className="button w-full py-2 bg-green-500 hover:bg-green-600"
                  onClick={handleLogin}
                >
                  <span className="button-text">
                    <FormattedMessage id="homeheader.login" />
                  </span>
                </button>
                <div className="flex items-center my-4 justify-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-2 text-sm italic text-gray-500">or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div className="text-center">
                  <button className="w-full py-2 bg-red-200 relative inline-flex justify-center items-center rounded-lg text-white group">
                    <span className="absolute inset-0 transition-colors duration-300 ease-linear border-4 border-transparent rounded-lg bg-red-500 group-hover:bg-red-600 bg-clip-content"></span>
                    <span className="relative z-10 font-bold text-[16px] leading-[1.65]">
                      <a href="/be/auth/google" className="flex items-center">
                        <BsGoogle className="text-lg mr-2" />
                        <FormattedMessage id="login.google" />
                      </a>
                    </span>
                  </button>
                </div>
              </div>
              <div className="link-login text-center">
                <p>
                  <FormattedMessage id="login.noaccount" /> {''}
                  <a href="/auth/signup" className="link">
                    <FormattedMessage id="homeheader.signup" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {loading && (
        <div className="loading-animation">
          <Loading />
        </div>
      )}
    </>
  );
}

export default Login;
