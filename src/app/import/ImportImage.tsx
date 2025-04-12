'use client';
import '../scss/ImportImage.scss';
import axios from '@/lib/axios';
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
  faInfoCircle,
  faTag,
  faGlobe,
  faLock,
} from '@fortawesome/free-solid-svg-icons';

import { getIntl } from '@/utils/i18n';
import { IMAGE_TYPES } from '@/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import StepAnnotation from '../components/StepAnnotation';
import CreateModel from '../components/CreateModel';
import ImageFromServer from '../components/ImageFromServer';
import {
  useAppDispatch,
  useAppSelector,
  selectLanguage,
  selectUser,
  setImagesRedux,
  selectAllDatasets,
  getDatasetsOfUserAsync,
  setSelDataset,
} from '@/lib/redux';
import type { ImageType } from '@/types/ImageType';
import { ProblemType } from '@/enums/ProblemType';
import { Dataset } from '@/entities/dataset.entity';
import { getObjectUrlFromPath } from '@/utils/general';
import { encodeUTF8, decodeUTF8 } from '@/utils/utf8';

interface DatasetForm {
  name: string;
  description: string;
  isPublic: boolean;
  type: ProblemType;
}

function ImportImage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUser);
  const recentHistory = useAppSelector(selectAllDatasets);
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
  const [previews, setPreviews] = useState<ImageType[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [datasetForm, setDatasetForm] = useState<DatasetForm>({
    name: '',
    description: '',
    isPublic: false,
    type: ProblemType.DETECT,
  });

  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.import.title' });
  }, [locale]);

  useEffect(() => {
    if (!userData) return;
    dispatch(getDatasetsOfUserAsync(userData.id));
  }, []);

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
    const imageFiles = files.map(
      file =>
        new File([file], `${Date.now()}$$${encodeUTF8(file.name)}`, {
          type: file.type,
        })
    );

    setImages([...images, ...imageFiles]);

    const newPreviews = imageFiles.map(file => {
      const obj_url = URL.createObjectURL(file);
      return { obj_url, name: decodeUTF8(file.name) };
    });
    setPreviews([...previews, ...newPreviews]);
  };

  const handleFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);

    const newFiles = Array.from(files).map(
      file =>
        new File([file], `${Date.now()}$$${encodeUTF8(file.name)}`, {
          type: file.type,
        })
    );

    setImages([...images, ...newFiles]);

    const newPreviews = newFiles.map(file => {
      const obj_url = URL.createObjectURL(file);
      return { obj_url, name: decodeUTF8(file.name) };
    });
    setPreviews([...previews, ...newPreviews]);

    setIsLoading(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index].obj_url);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    previews.forEach(img => URL.revokeObjectURL(img.obj_url));
    setImages([]);
    setPreviews([]);
    setShowDeleteDialog(false);
  };

  const handleUploadFiles = async () => {
    if (isLoading || previews.length === 0) return;

    try {
      setIsLoading(true);
      dispatch(setImagesRedux(previews));
      router.push('/annotation-tool');
    } catch (error) {
      console.error('Error during upload:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDatasetForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatasetForm(prev => ({ ...prev, isPublic: e.target.checked }));
  };

  const handleTypeSelect = (type: ProblemType) => {
    setDatasetForm(prev => ({ ...prev, type }));
  };

  const handleModelSelectLocal = (model: string) => {
    setSelectedModel(model);
    handleModelSelect(model);
    setIsDropdownOpen(false);
  };

  const handleCreateDataset = async () => {
    try {
      setIsLoading(true);
      dispatch(setImagesRedux(previews));

      const formData = new FormData();
      formData.append('name', datasetForm.name);
      formData.append('description', datasetForm.description);
      formData.append('isPublic', String(datasetForm.isPublic));
      formData.append('type', datasetForm.type);
      formData.append('model', selectedModel);
      formData.append('userId', userData!.id);
      images.forEach(img => formData.append('imgs', img));

      const response = await axios.post('/be/datasets/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const dataset = response.data;
      if (!dataset) {
        throw new Error('Dataset creation failed');
      }
      dispatch(setSelDataset(dataset));

      setImages([]);
      setPreviews([]);

      if (datasetForm.type === ProblemType.DETECT) {
        router.push('/annotation-tool');
      } else {
        router.push('/classify-tool');
      }
    } catch (error) {
      console.error('Error creating dataset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoDataset = async (dataset: Dataset) => {
    setIsLoading(true);
    dispatch(setSelDataset(dataset));

    const imagesOfDataset: ImageType[] = [];
    for (const img of dataset.images) {
      const fileUrl = await getObjectUrlFromPath(img.path);
      if (fileUrl) {
        imagesOfDataset.push({
          obj_url: fileUrl,
          name: img.name,
        });
      }
    }
    dispatch(setImagesRedux(imagesOfDataset));

    if (dataset.type === ProblemType.DETECT) {
      router.push(`/annotation-tool`);
    } else {
      router.push(`/classify-tool`);
    }
    setIsLoading(false);
  };

  const renderPreviews = () => {
    const displayCount = 7;
    const totalCount = previews.length;
    const displayPreviews = previews.slice(0, displayCount);

    return (
      <div className="space-y-4 my-6">
        {/* Clear All Button with Modal */}
        {userData ? (
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
        ) : null}

        {/* Delete Confirmation Modal */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Clear All Images</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel the operation? This action will
                remove all images.
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
          {displayPreviews.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.obj_url}
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
          {!userData ? (
            <div
              className={`import-box ${previews.length > 0 ? 'pb-8' : 'pb-12'}`}
            >
              <div className="model-option">
                <div className="title">
                  <a href="/auth/login" className="login-button">
                    <FormattedMessage id="homeheader.login" />
                  </a>
                  <div className="discover-text">
                    <FormattedMessage id="import.discover" />
                  </div>
                </div>
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

              {/* Upload Button */}
              {previews.length > 0 && (
                <div className="action-buttons">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <FormattedMessage
                      id="import.cancel"
                      defaultMessage="Cancel"
                    />
                  </button>
                  <button onClick={handleUploadFiles} className="upload-button">
                    <FormattedMessage
                      id="import.uploadFiles"
                      defaultMessage="Upload Files"
                    />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="importBox">
              <div className="tabsContainer">
                <div
                  className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="tabIcon" />
                  <span>
                    <FormattedMessage
                      id="dataset.details"
                      defaultMessage="Dataset Details"
                    />
                  </span>
                </div>
                <div
                  className={`tab ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="tabIcon"
                  />
                  <span>
                    <FormattedMessage
                      id="dataset.files"
                      defaultMessage="Upload Images"
                    />
                  </span>
                </div>
              </div>

              <div className="formContent">
                {activeTab === 'details' ? (
                  <div className="detailsTab">
                    <h2 className="sectionTitle">
                      <FormattedMessage
                        id="dataset.createNew"
                        defaultMessage="Create New Dataset"
                      />
                    </h2>

                    <div className="formGroup">
                      <label htmlFor="name" className="formLabel">
                        <FontAwesomeIcon icon={faTag} className="labelIcon" />
                        <FormattedMessage
                          id="dataset.name"
                          defaultMessage="Dataset Name"
                        />
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={datasetForm.name}
                        onChange={handleInputChange}
                        className="formInput"
                        placeholder="Enter dataset name"
                        required
                      />
                    </div>

                    <div className="formGroup">
                      <label htmlFor="description" className="formLabel">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="labelIcon"
                        />
                        <FormattedMessage
                          id="dataset.description"
                          defaultMessage="Description"
                        />
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={datasetForm.description}
                        onChange={handleInputChange}
                        className="formTextarea"
                        placeholder="Briefly describe your dataset"
                        rows={4}
                      />
                    </div>

                    <div className="formRow">
                      <div className="formGroup">
                        <label className="formLabel">
                          <FontAwesomeIcon
                            icon={datasetForm.isPublic ? faGlobe : faLock}
                            className="labelIcon"
                          />
                          <FormattedMessage
                            id="dataset.visibility"
                            defaultMessage="Visibility"
                          />
                        </label>
                        <div className="toggleContainer">
                          <label className="toggleSwitch">
                            <input
                              type="checkbox"
                              checked={datasetForm.isPublic}
                              onChange={handleCheckboxChange}
                            />
                            <span className="toggleSlider"></span>
                          </label>
                          <span className="toggleLabel">
                            {datasetForm.isPublic ? (
                              <FormattedMessage
                                id="dataset.public"
                                defaultMessage="Public"
                              />
                            ) : (
                              <FormattedMessage
                                id="dataset.private"
                                defaultMessage="Private"
                              />
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          <FormattedMessage
                            id="dataset.type"
                            defaultMessage="Dataset Type"
                          />
                          <span className="required">*</span>
                        </label>
                        <div className="typeSelector">
                          <button
                            type="button"
                            className={`typeButton ${
                              datasetForm.type === ProblemType.DETECT
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => handleTypeSelect(ProblemType.DETECT)}
                          >
                            <FormattedMessage
                              id="dataset.detect"
                              defaultMessage="Detect"
                            />
                          </button>
                          <button
                            type="button"
                            className={`typeButton ${
                              datasetForm.type === ProblemType.CLASSIFY
                                ? 'active'
                                : ''
                            }`}
                            onClick={() =>
                              handleTypeSelect(ProblemType.CLASSIFY)
                            }
                          >
                            <FormattedMessage
                              id="dataset.classify"
                              defaultMessage="Classify"
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="actionButtons">
                      <button
                        type="button"
                        className="nextButton"
                        onClick={() => setActiveTab('files')}
                      >
                        <FormattedMessage
                          id="dataset.next"
                          defaultMessage="Next: Upload Files"
                        />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="filesTab">
                    <div className="modelSection">
                      <div className="title">
                        <div>
                          <FormattedMessage
                            id="import.choose1"
                            defaultMessage="Choose your model"
                          />
                        </div>
                        <button onClick={handleClick} className="createButton">
                          <FormattedMessage
                            id="import.choose2"
                            defaultMessage="or create a new one"
                          />
                        </button>
                      </div>

                      {listModel?.length > 0 && (
                        <div className="customSelect">
                          <div
                            className="selectHeader"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          >
                            <span>{selectedModel}</span>
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`selectIcon ${isDropdownOpen ? 'open' : ''}`}
                            />
                          </div>
                          {isDropdownOpen && (
                            <div className="selectOptions">
                              {listModel.map((model, index) => (
                                <div
                                  key={index}
                                  className={`selectOption ${
                                    selectedModel === model ? 'selected' : ''
                                  }`}
                                  onClick={() => handleModelSelectLocal(model)}
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
                      className={`uploadZone ${isDragging ? 'dragging' : ''}`}
                    >
                      <label className="uploadLabel">
                        <input
                          type="file"
                          accept={IMAGE_TYPES.map(type => `.${type}`).join(',')}
                          multiple
                          onChange={handleFilesChange}
                          className="hiddenInput"
                          value={''}
                        />
                        <div className="uploadContent">
                          <FontAwesomeIcon
                            icon={faCloudUploadAlt}
                            className="uploadIcon"
                          />
                          <span className="uploadText">
                            <FormattedMessage
                              id="import.upload"
                              defaultMessage="Upload your files"
                            />
                          </span>
                          <div className="uploadInfo">
                            <span className="uploadSubtext">
                              Drag & drop your files or click to browse
                            </span>
                            <span className="fileTypes">
                              Supports: {IMAGE_TYPES.join(', ')}
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="actionButtons">
                      <button
                        type="button"
                        className="backButton"
                        onClick={() => setActiveTab('details')}
                      >
                        <FormattedMessage
                          id="dataset.back"
                          defaultMessage="Back to Details"
                        />
                      </button>

                      <button
                        onClick={handleCreateDataset}
                        className="createDatasetButton"
                      >
                        <FormattedMessage
                          id="dataset.create"
                          defaultMessage="Create Dataset"
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Previews */}
          {previews.length > 0 && renderPreviews()}

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
                  <div
                    key={item.id}
                    className="history-card"
                    onClick={() => handleGoDataset(item)}
                  >
                    <div className="history-image">
                      <ImageFromServer filePath={item.images[0].path} />
                      <div className="image-overlay">
                        <button className="view-button">View Details</button>
                      </div>
                    </div>
                    <div className="history-info">
                      <div className="info-text">
                        <h3 className="history-name">{item.name}</h3>
                        <span className="history-date">
                          Updated at{' '}
                          {new Date(item.updated_at).toLocaleString()}
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
