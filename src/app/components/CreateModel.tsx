import '../scss/CreateModel.scss';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PopupAnnotation from './PopupAnnotation';
import { getIntl } from '@/utils/i18n';
import {
  useAppSelector,
  useAppDispatch,
  setIsUploadModal,
  selectIsUploadModal,
  selectLanguage,
} from '@/lib/redux';

function CreateModel() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    description: '',
  });
  const check = useAppSelector(selectIsUploadModal);

  const intl = getIntl(useAppSelector(selectLanguage));
  const dispatch = useAppDispatch();

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'create.error.name';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'create.error.description';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleClickUpload = () => {
    if (validateForm()) {
      dispatch(setIsUploadModal(true));
    }
  };

  return (
    <div className="create-container">
      <div className="create-header">
        <FormattedMessage id="create.title" />
      </div>
      <div className="create-content">
        <div className="import-box">
          <div
            className={`upload-box ${!name || !description ? 'disabled' : ''}`}
            onClick={handleClickUpload}
          >
            <div className="upload-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8L12 3L7 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="upload-title">
              <FormattedMessage id="import.upload" />
            </div>
          </div>
          <PopupAnnotation name={name} description={description} />
          <div className="model-info">
            <div className="model-name">
              <div className="header">
                <FormattedMessage id="create.model" />
                <span className="required">*</span>
              </div>
              <input
                className={`name-input ${errors.name ? 'error' : ''}`}
                type="text"
                value={name}
                onChange={event => {
                  setName(event.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="example_model"
              />
              {errors.name && (
                <div className="error-message">
                  <FormattedMessage id={errors.name} />
                </div>
              )}
            </div>
            <div className="model-name">
              <div className="header">
                <FormattedMessage id="create.description" />{' '}
                <span className="required">*</span>
              </div>
              <textarea
                className={`description-input ${errors.description ? 'error' : ''}`}
                value={description}
                spellCheck="false"
                placeholder={intl.formatMessage({
                  id: 'create.placeholder',
                })}
                onChange={event => {
                  setDescription(event.target.value);
                  if (errors.description)
                    setErrors({ ...errors, description: '' });
                }}
              />
              {errors.description && (
                <div className="error-message">
                  <FormattedMessage id={errors.description} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateModel;
