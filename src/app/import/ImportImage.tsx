'use client';
import '../scss/ImportImage.scss';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAnglesRight,
  faEllipsis,
  faCloudUploadAlt,
  faHistory,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, selectLanguage, selectUser } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import { IMAGE_TYPES } from '@/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import StepAnnotation from '../components/StepAnnotation';
import CreateModel from '../components/CreateModel';
import axios from 'axios';

const recentHistory = [
  {
    id: 1,
    name: 'History 1',
    date: '6/2/2025',
    image:
      'https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/a58b/live/02223d90-d9e5-11ed-985e-f3049d8cc016.jpg.webp',
  },
  {
    id: 2,
    name: 'History 2',
    date: '8/2/2025',
    image:
      'https://static-images.vnncdn.net/files/publish/2022/12/21/screen-shot-2022-12-21-at-191604-1423.png',
  },
];

function ImportImage() {
  const router = useRouter();
  const userData = useAppSelector(selectUser);
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);
  const createModelRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [listModel, setListModel] = useState([
    'Default Model',
    'YOLO Model',
    'RetinaNet',
    'Faster R-CNN',
    'SSD Model',
  ]);

  const [selectedModel, setSelectedModel] = useState('Default Model');
  const [isLoading, setIsLoading] = useState(false);
  const [backend, setBackend] = useState('');

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.import.title' });
  }, [locale]);

  const handleClick = () => {
    if (createModelRef?.current) {
      createModelRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };

  const onFilesZipChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsLoading(true);
    try {
      const listImage = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('upload_preset', 'ocrNom');

        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dm3pvrs73/image/upload',
          formData
        );
        listImage.push(response.data.secure_url);
      }

      await axios.post(`${backend}/api/detect`, { link: listImage });
      router.push('/annotation-tool');
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="import-container">
        <div className="import-content">
          <h1 className="import-header">
            <FormattedMessage
              id={userData ? 'project.login' : 'project.unlogin'}
            />
          </h1>

          <div className="import-box">
            <div className="model-option">
              {userData ? (
                <div className="title">
                  <div>
                    <FormattedMessage id="import.choose1" />
                  </div>
                  <button onClick={handleClick} className="create-button">
                    <FormattedMessage id="import.choose2" />
                  </button>
                </div>
              ) : (
                <div className="title">
                  <a href="/auth/login" className="login-button">
                    <FormattedMessage id="homeheader.login" />
                  </a>
                  <div className="discover-text">
                    <FormattedMessage id="import.discover" />
                  </div>
                </div>
              )}

              {userData && listModel?.length > 0 && (
                <div className="custom-select">
                  <div
                    className="select-header"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>{selectedModel}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`select-icon ${isDropdownOpen ? 'open' : ''}`}
                    />
                  </div>
                  {isDropdownOpen && (
                    <div className="select-options">
                      {listModel.map((model, index) => (
                        <div
                          key={index}
                          className={`select-option ${selectedModel === model ? 'selected' : ''}`}
                          onClick={() => handleModelSelect(model)}
                        >
                          {model}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="upload-zone">
              <label className="upload-label">
                <input
                  type="file"
                  accept={IMAGE_TYPES.map(type => `.${type}`).join(',')}
                  multiple
                  onChange={onFilesZipChange}
                  className="hidden-input"
                />
                <div className="upload-content">
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="upload-icon"
                  />
                  <span className="upload-text">
                    <FormattedMessage id="import.upload" />
                  </span>
                  <span className="upload-subtext">
                    Drag & drop your files or click to browse
                  </span>
                </div>
              </label>
            </div>
          </div>

          {userData ? (
            <section className="history-section">
              <div className="history-header">
                <h2 className="history-title">
                  <FontAwesomeIcon icon={faHistory} className="history-icon" />
                  <FormattedMessage id="import.history" />
                </h2>
                <button className="see-all-button">
                  <span>
                    <FormattedMessage id="import.seeall" />
                  </span>
                  <FontAwesomeIcon icon={faAnglesRight} />
                </button>
              </div>

              <div className="history-grid">
                {recentHistory.map(item => (
                  <div key={item.id} className="history-card">
                    <div className="history-image">
                      <img src={item.image} alt={item.name} />
                      <div className="image-overlay">
                        <button className="view-button">View Details</button>
                      </div>
                    </div>
                    <div className="history-info">
                      <div className="info-text">
                        <h3 className="history-name">{item.name}</h3>
                        <span className="history-date">
                          Created at {item.date}
                        </span>
                      </div>
                      <button className="action-button">
                        <FontAwesomeIcon icon={faEllipsis} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      {userData ? (
        <div className="create-model-section" ref={createModelRef}>
          <CreateModel />
        </div>
      ) : null}
      <StepAnnotation />
      <Footer />
      {isLoading && (
        <div className="loading-animation">
          <Loading />
        </div>
      )}
    </div>
  );
}

export default ImportImage;
