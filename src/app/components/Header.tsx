import '../scss/Header.scss';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquarePen,
  faKey,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from 'react-intl';
import { ChevronDown } from 'lucide-react';
import {
  useAppSelector,
  useAppDispatch,
  changeLanguage,
  selectUser,
  fetchUserDataAsync,
} from '@/lib/redux';
import NavBar from './NavBar';

function Header() {
  const userData = useAppSelector(selectUser);

  const [isOpen, setIsOpen] = useState(false);
  const [isToggle, setIsToggle] = useState(false);
  const [selectedLang, setSelectedLang] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUserDataAsync());
    if (typeof window !== 'undefined') {
      // selectedLang = false: Vietnamese | selectedLang = true: English
      setSelectedLang(false);
      if (localStorage.getItem('lang-now') === 'en') {
        setSelectedLang(true);
      }
    }
  }, []);

  const handleClickToggle = () => {
    setIsToggle(!isToggle);
  };

  const handleLanguageSelect = (lang: 'en' | 'vi') => {
    setSelectedLang(lang === 'en');
    setIsOpen(false);
    dispatch(changeLanguage(lang));
    localStorage.setItem('lang-now', lang);
  };

  return (
    <div className="header-container">
      <div className="header-content">
        <div className="header-logo">
          <NavBar />
          <a className="logo-link" href="/">
            <div className="logo-image">
              <span className="figure-image">
                <img className="image-uet" src="/favicon.ico" alt="UET" />
              </span>
            </div>
            <div className="header-title">
              <span className="school">
                <FormattedMessage id="homeheader.university" />
              </span>
              <span className="tool-name">Sino - Nom</span>
            </div>
          </a>
        </div>
        <div className="header-wrapper">
          <div className="top-nav">
            <div className="nav-lang">
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-md hover:bg-blue-50"
                >
                  {selectedLang ? (
                    <Image
                      src="/images/eng-flag.png"
                      width={22}
                      height={22}
                      alt=""
                    />
                  ) : (
                    <Image
                      src="/images/vietnam-flag.png"
                      width={22}
                      height={22}
                      alt=""
                    />
                  )}
                  <span>
                    {selectedLang ? (
                      <FormattedMessage id="homeheader.en" />
                    ) : (
                      <FormattedMessage id="homeheader.vi" />
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {isOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                    <button
                      onClick={() => handleLanguageSelect('en')}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50
                        ${selectedLang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                      `}
                    >
                      <Image
                        src="/icons/gb.png"
                        width={25}
                        height={25}
                        alt=""
                      />
                      <FormattedMessage id="homeheader.en" />
                    </button>
                    <button
                      onClick={() => handleLanguageSelect('vi')}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50
                        ${!selectedLang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                      `}
                    >
                      <Image
                        src="/icons/vn.svg"
                        width={25}
                        height={25}
                        alt=""
                      />
                      <FormattedMessage id="homeheader.vi" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!userData ? (
              <>
                <a className="nav-login" href="/auth/login">
                  <span className="title-login">
                    <FormattedMessage id="homeheader.login" />
                  </span>
                </a>
                <a className="nav-signup" href="/auth/signup">
                  <span className="title-signup">
                    <FormattedMessage id="homeheader.signup" />
                  </span>
                </a>
              </>
            ) : (
              <>
                <div className="account" onClick={handleClickToggle}>
                  <div className="account-dropdown">
                    <div className="account-avatar">
                      <div className="circle-avatar">
                        {userData.avatar_url ? (
                          <img
                            src={userData.avatar_url}
                            alt="avatar"
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text">
                            {userData.name?.split(' ').pop()?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span>
                      <FormattedMessage id="homeheader.hi" />
                      {userData.name}
                    </span>
                  </div>
                  {isToggle ? (
                    <div className="dropdown-menu">
                      <div className="account-detail">
                        <div className="avatar">
                          <div className="image">
                            {userData.avatar_url ? (
                              <img
                                src={userData.avatar_url}
                                alt="avatar"
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text">
                                {userData.name?.split(' ').pop()?.charAt(0) ||
                                  'U'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="information">
                          <p className="name">{userData.name}</p>
                          <span className="email">{userData.email}</span>
                        </div>
                      </div>
                      <a href="/" className="account-link">
                        <i className="icon">
                          <FontAwesomeIcon icon={faSquarePen} />
                        </i>
                        <span className="title">
                          <FormattedMessage id="homeheader.profile" />
                        </span>
                      </a>
                      <a href="/" className="account-link">
                        <i className="icon">
                          <FontAwesomeIcon icon={faKey} />
                        </i>
                        <span className="title">
                          <FormattedMessage id="homeheader.changepass" />
                        </span>
                      </a>
                      <a href="/be/auth/logout" className="account-link">
                        <i className="icon">
                          <FontAwesomeIcon icon={faRightFromBracket} />
                        </i>
                        <span className="title">
                          <FormattedMessage id="homeheader.logout" />
                        </span>
                      </a>
                    </div>
                  ) : (
                    <div> </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="bot-nav">
            <div className="bot-nav-container">
              <div className="bot-nav-content">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <a className="home-icon" href="/">
                      <svg
                        fill="none"
                        height="13"
                        width="14"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 6.381v.232c-.125.278-.362.37-.673.347-.387-.012-.786 0-1.173 0h-.15v4.594c0 .844-.648 1.446-1.558 1.446H8.588c-.387 0-.586-.174-.586-.544V9.783c0-.312-.212-.497-.537-.497H6.58c-.387 0-.574.173-.574.532v2.661c0 .336-.2.521-.56.521H3.598c-.96 0-1.596-.59-1.596-1.481V6.96H.532c-.225 0-.387-.093-.487-.278-.087-.185-.05-.37.125-.532l.062-.058L6.555.226c.324-.301.561-.301.898 0l6.273 5.82c.087.092.174.22.274.335Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="link yourmodel" href="/your-model">
                      <FormattedMessage id="homeheader.yourmodel" />
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="link" href="/request">
                      <FormattedMessage id="homeheader.request" />
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="link" href="/contact">
                      <FormattedMessage id="homeheader.contact" />
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="link" href="/about-us">
                      <FormattedMessage id="homeheader.aboutus" />
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="link" href="/contact">
                      <FormattedMessage id="homeheader.documentation" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
