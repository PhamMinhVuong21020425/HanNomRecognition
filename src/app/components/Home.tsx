'use client';
import '../scss/Home.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import Header from './Header';
import Footer from './Footer';
import Handbook from './Handbook';
import Gallery from './Gallery';
import { FormattedMessage } from 'react-intl';
import { useAppSelector, selectUser } from '@/lib/redux';

function Home() {
  const userData = useAppSelector(selectUser);

  return (
    <div>
      <Header />
      <div className="body">
        <div className="project-content">
          <div className="project-header font-sans">
            <FormattedMessage id="project.title" />
          </div>
          <div className="project-option">
            <div className="left bg-blue-100">
              <div className="left-title">
                <FormattedMessage id="project.unlogin" />
              </div>
              <div className="left-description">
                <FormattedMessage id="project.unlogintopdescription" />
              </div>
              <div className="left-feature">
                <div className="feature">
                  <FormattedMessage id="project.botunlogindescription1" />
                </div>
                <div className="feature">
                  <FormattedMessage id="project.botunlogindescription2" />
                </div>
              </div>
              <a href="/import" className="project-button">
                <div className="title">
                  <FormattedMessage id="project.loginstart" />
                </div>
                <div className="icon">
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </a>
            </div>
            <div className="right">
              <div className="left-title">
                <FormattedMessage id="project.login" />
              </div>
              <div className="left-description">
                <FormattedMessage id="project.logintopdescription" />
              </div>
              <div className="left-feature">
                <div className="feature">
                  <FormattedMessage id="project.botlogindescription1" />
                </div>
                <div className="feature">
                  <FormattedMessage id="project.botlogindescription2" />
                </div>
              </div>
              {userData ? (
                <a href="/import" className="project-button">
                  <div className="title">
                    <FormattedMessage id="project.loginstart" />
                  </div>
                  <div className="icon">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </a>
              ) : (
                <a href="/login" className="project-button">
                  <div className="title">
                    <FormattedMessage id="project.unloginstart" />
                  </div>
                  <div className="icon">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="handbook-container">
          <div className="handbook-wrapper">
            <div className="handbook-content">
              <div className="handbook-title font-sans">
                <FormattedMessage id="handbook.title" />
              </div>
              <div className="handbook-slider">
                <Handbook />
              </div>
            </div>
          </div>
          <Gallery />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
