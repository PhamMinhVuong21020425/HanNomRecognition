import '../scss/NavBar.scss';
import { useState } from 'react';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, selectUser } from '@/lib/redux';
import { UserRole } from '@/enums/UserRole';

function NavBar() {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  const handleHiddenNav = () => {
    setShowMenu(false);
  };

  const userData = useAppSelector(selectUser);

  return (
    <div>
      <div className="menu-icon" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>
      <div className={`navbar ${showMenu ? 'open' : ''}`}>
        <FontAwesomeIcon
          onClick={toggleMenu}
          className="close-button"
          icon={faXmark}
        />
        <div className="user-info">
          <div className="account-dropdown">
            <div className="account-avatar">
              <div className="circle-avatar">
                {userData ? (
                  userData.avatar_url ? (
                    <img
                      src={userData.avatar_url}
                      alt="avatar"
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text">
                      {userData.name?.split(' ').pop()?.charAt(0) || 'U'}
                    </span>
                  )
                ) : (
                  <span className="text">G</span>
                )}
              </div>
            </div>
            <span>{userData ? userData.name : 'Guest'}</span>
          </div>
        </div>
        <ul className="navbar-nav">
          <li onClick={handleHiddenNav} className="nav-item">
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
          {userData && userData.role === UserRole.ADMIN ? (
            <li onClick={handleHiddenNav} className="nav-item">
              <a className="link" href="/admin">
                <FormattedMessage id="homeheader.admin" />
              </a>
            </li>
          ) : null}
          <li onClick={handleHiddenNav} className="nav-item">
            <a className="link" href="/your-model">
              <FormattedMessage id="homeheader.yourmodel" />
            </a>
          </li>
          <li onClick={handleHiddenNav} className="nav-item">
            <a className="link" href="/request">
              <FormattedMessage id="homeheader.request" />
            </a>
          </li>

          <li onClick={handleHiddenNav} className="nav-item">
            <a className="link" href="/documentation">
              <FormattedMessage id="homeheader.documentation" />
            </a>
          </li>
          <li onClick={handleHiddenNav} className="nav-item">
            <a className="link" href="/about-us">
              <FormattedMessage id="homeheader.aboutus" />
            </a>
          </li>
          <li onClick={handleHiddenNav} className="nav-item">
            <a className="link" href="/contact">
              <FormattedMessage id="homeheader.contact" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavBar;
