'use client';
import '@/app/scss/SignUp.scss';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Loading from '@/app/components/Loading';
import { FormattedMessage } from 'react-intl';
import IntlProviderWrapper from '@/app/translations/IntlProviderWrapper';
import { useAppSelector, selectLanguage } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import request from '@/lib/axios';

type ErrorMessage = {
  param: string;
  msg: string;
};

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState(false);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [errMessage, setErrMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.signup.title' });
  }, [locale]);

  const handleSignUp = async () => {
    setLoading(true);
    setErrors([]);
    setErrMessage('');

    if (!license) {
      setErrMessage('error.license_required');
      setLoading(false);
      return;
    }

    const data = {
      email,
      password,
      confirmPassword,
      gender,
      name,
      phone,
    };

    const response = await request.post('/be/auth/register', data);
    if (response.data.error_msg) {
      setErrMessage(response.data.error_msg);
    }

    if (response.data.errors) {
      setErrors(response.data.errors);
    }

    if (response.data.status === 'verify') {
      router.push(`/auth/verify/${encodeURIComponent(email)}`);
    }

    setLoading(false);
  };

  return (
    <IntlProviderWrapper>
      <Header />
      <div className="signup-container">
        <div className="signup-content">
          <div className="signup-inner">
            <div className="side-bar">
              <div className="title">
                <FormattedMessage id="signup.reason" />
              </div>
              <div className="text">
                <p>
                  <FormattedMessage id="signup.reason-content" />
                </p>
              </div>
              <ul className="list">
                <li className="item">
                  <FormattedMessage id="signup.item1" />
                </li>
                <li className="item">
                  <FormattedMessage id="signup.item2" />
                </li>
                <li className="item">
                  <FormattedMessage id="signup.item3" />
                </li>
              </ul>
            </div>
            <div className="main">
              <div className="main-title">
                <FormattedMessage id="signup.title" />
              </div>
              <div className="text-red-500 text-sm text-center mb-4">
                {errMessage && intl.formatMessage({ id: errMessage })}
              </div>
              <div className="signup-form">
                <div className="account-row">
                  <div className="field">
                    <label className="field-label">
                      Email {''}
                      <span className="force">*</span>
                    </label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="example@email.com"
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
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
                  <div className="field">
                    <label className="field-label">
                      <FormattedMessage id="signup.password" /> {''}
                      <span className="force">*</span>
                    </label>
                    <input
                      className="field-input"
                      type="password"
                      placeholder="123456789"
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
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
                  </div>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="gender">
                    <div className="field">
                      <label className="field-label">
                        <FormattedMessage id="signup.gender" /> {''}
                        <span className="force">*</span>
                      </label>
                      <div className="checkbox">
                        <div className="form-check">
                          <input
                            id="male"
                            name="gender"
                            className="check-input"
                            type="radio"
                            value="Male"
                            defaultChecked
                            onChange={e => setGender(e.target.value)}
                          />
                          <label htmlFor="male" className="name-gender">
                            <FormattedMessage id="signup.male" />
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            id="female"
                            name="gender"
                            className="check-input"
                            type="radio"
                            value="Female"
                            onChange={e => setGender(e.target.value)}
                          />
                          <label htmlFor="female" className="name-gender">
                            <FormattedMessage id="signup.female" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-8 pl-4 pt-0 flex-col w-1/2">
                    <label className="mb-4 text-[13px] text-[#555] font-bold">
                      <FormattedMessage id="signup.confirmpassword" /> {''}
                      <span className="force text-[#ec2517]">*</span>
                    </label>
                    <input
                      className="border rounded-md h-9 px-3 mt-2 bg-[#fafafa] border-[#e2e2e2] w-full text-[13px] leading-[1.2]"
                      type="password"
                      placeholder="123456789"
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    {errors.map(error => {
                      if (error.param === 'confirmPassword') {
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
                </div>
                <div className="info-account">
                  <div className="field">
                    <label className="field-label">
                      <FormattedMessage id="signup.fullname" /> {''}
                      <span className="force">*</span>
                    </label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="UET-VNU"
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    {errors.map(error => {
                      if (error.param === 'name') {
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
                  <div className="field">
                    <label className="field-label">
                      <FormattedMessage id="signup.phone" /> {''}
                      <span className="force">*</span>
                    </label>
                    <input
                      className="field-input"
                      type="phone"
                      placeholder="0365016829"
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                    {errors.map(error => {
                      if (error.param === 'phone') {
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
                </div>

                <div className="license">
                  <div className="license-check">
                    <input
                      id="license"
                      name="license"
                      className="license-input"
                      type="checkbox"
                      onChange={e => setLicense(e.target.checked)}
                      required
                    />
                    <label htmlFor="license" className="license-label">
                      <FormattedMessage id="signup.policy" /> {''}
                      <a
                        className="link-license"
                        target="blank"
                        href="https://vn.joboko.com/chinh-sach-bao-mat"
                      >
                        <FormattedMessage id="signup.policy-private" />
                      </a>
                      <FormattedMessage id="signup.annotation" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="sign-up-button">
                <button
                  className="button-content"
                  type="submit"
                  onClick={handleSignUp}
                >
                  <span className="button-title">
                    <FormattedMessage id="homeheader.signup" />
                  </span>
                </button>
                <div className="link-content">
                  <div className="exist-account">
                    <FormattedMessage id="signup.haveaccount" />
                  </div>
                  <a className="login-link" href="/auth/login">
                    <FormattedMessage id="homeheader.login" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {loading && (
        <div className="loading-animation">
          <Loading />
        </div>
      )}
    </IntlProviderWrapper>
  );
}
