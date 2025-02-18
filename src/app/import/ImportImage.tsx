'use client';
import '../scss/ImportImage.scss';
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
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

import { getIntl } from '@/utils/i18n';
import { IMAGE_TYPES } from '@/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import StepAnnotation from '../components/StepAnnotation';
import CreateModel from '../components/CreateModel';
import axios from 'axios';
import {
  useAppDispatch,
  useAppSelector,
  selectLanguage,
  selectUser,
  setImagesRedux,
  setDetections,
} from '@/lib/redux';

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
  const dispatch = useAppDispatch();
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

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file =>
      IMAGE_TYPES.some(type => file.type.includes(type))
    );
    setImages([...images, ...imageFiles]);

    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const handleFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);

    const newFiles = Array.from(files).filter(file =>
      IMAGE_TYPES.some(type => file.type.includes(type))
    );
    setImages([...images, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);

    setIsLoading(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setPreviews([]);
    setShowDeleteDialog(false);
  };

  const handleUploadFiles = async () => {
    if (isLoading || previews.length === 0) return;

    try {
      setIsLoading(true);
      dispatch(setImagesRedux(images));
      const formData = new FormData();
      images.forEach(image => formData.append('files', image));

      const response = await axios.post(
        'http://localhost:5000/api/detect',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      dispatch(setDetections(response.data));
      handleClearAll();
      router.push('/annotation-tool');
    } catch (error) {
      console.error('Error during upload:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreviews = () => {
    const displayCount = 7;
    const totalCount = previews.length;
    const displayPreviews = previews.slice(0, displayCount);

    return (
      <div className="space-y-4 my-6">
        {/* Clear All Button with Modal */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={previews.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors
              ${
                previews.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Clear All Images</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove all images? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Grid */}
        <div className="grid lg:grid-cols-8 md:grid-cols-6 sm:grid-cols-4 gap-4 mt-6">
          {displayPreviews.map((src, index) => (
            <div key={index} className="relative group">
              <img
                src={src}
                alt={`preview ${index}`}
                className="w-32 h-32 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-2 bg-gray-800 hover:bg-black text-white rounded-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {totalCount > displayCount && (
            <div className="flex items-center justify-center w-32 h-32 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">
                +{totalCount - displayCount} more
              </span>
            </div>
          )}
        </div>
      </div>
    );
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

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`upload-zone ${isDragging ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}`}
            >
              <label className="upload-label">
                <input
                  type="file"
                  accept={IMAGE_TYPES.map(type => `.${type}`).join(',')}
                  multiple
                  onChange={handleFilesChange}
                  className="hidden-input"
                  value={''}
                />
                <div className="upload-content">
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="upload-icon"
                  />
                  <span className="upload-text">
                    <FormattedMessage id="import.upload" />
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="upload-subtext">
                      Drag & drop your files or click to browse
                    </span>
                    <span className="text-sm text-gray-500">
                      Supports: {IMAGE_TYPES.join(', ')}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && renderPreviews()}

          {/* Upload Button */}
          {previews.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={handleUploadFiles}
                className="bg-black text-white px-8 py-2 rounded-lg transition-colors"
              >
                Upload Files
              </button>
            </div>
          )}

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
