import '../scss/ModelDetailModal.scss';
import React, { useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  selectIsOpenDescript,
  setIsOpenDescript,
  selectLanguage,
  selectUser,
  updateModelAsync,
  deleteModelAsync,
} from '@/lib/redux';
import { Model } from '@/entities/model.entity';
import { getIntl } from '@/utils/i18n';
import { ModelStatus } from '@/enums/ModelStatus';

const ModelDetailModal = ({ model }: { model: Model }) => {
  const isOpen = useAppSelector(selectIsOpenDescript);
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUser);
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  const [isEditing, setIsEditing] = useState(false);
  const [editedModel, setEditedModel] = useState<Model>({ ...model });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    dispatch(setIsOpenDescript(false));
    setIsEditing(false);
    setIsConfirmingDelete(false);
  };

  const handleStartEditing = () => {
    setEditedModel({ ...model });
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedModel({ ...model });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedModel(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      dispatch(updateModelAsync(editedModel));
      setIsEditing(false);
      setIsLoading(false);
      handleClose();
    } catch (error) {
      console.error('Error updating model:', error);
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async () => {
    try {
      setIsLoading(true);
      dispatch(deleteModelAsync(model.id));
      setIsLoading(false);
      handleClose();
    } catch (error) {
      console.error('Error deleting model:', error);
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: ModelStatus) => {
    switch (status) {
      case ModelStatus.PENDING:
        return intl.formatMessage({ id: 'yourmodel.pending' }) || 'Pending';
      case ModelStatus.TRAINING:
        return intl.formatMessage({ id: 'yourmodel.training' }) || 'Training';
      case ModelStatus.COMPLETED:
        return intl.formatMessage({ id: 'yourmodel.completed' }) || 'Completed';
      case ModelStatus.FAILED:
        return intl.formatMessage({ id: 'yourmodel.failed' }) || 'Failed';
      default:
        return status;
    }
  };

  const getStatusClass = (status: ModelStatus) => {
    switch (status) {
      case ModelStatus.PENDING:
        return 'status-pending';
      case ModelStatus.TRAINING:
        return 'status-training';
      case ModelStatus.COMPLETED:
        return 'status-completed';
      case ModelStatus.FAILED:
        return 'status-failed';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="model-detail-modal-overlay">
      <div className="model-detail-modal">
        <div className="modal-header">
          <h2>
            {isEditing
              ? intl.formatMessage({ id: 'yourmodel.editModel' })
              : model.name}
          </h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {isConfirmingDelete ? (
            <div className="delete-confirmation">
              <div className="warning-icon">⚠️</div>
              <h3>
                {intl.formatMessage({ id: 'yourmodel.confirmDelete' }) ||
                  'Confirm Deletion'}
              </h3>
              <p>
                {intl.formatMessage(
                  { id: 'yourmodel.deleteModelWarning' },
                  { modelName: model.name }
                ) ||
                  `Are you sure you want to delete the model "${model.name}"? This action cannot be undone.`}
              </p>
              <div className="action-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isLoading}
                >
                  {intl.formatMessage({ id: 'yourmodel.cancel' }) || 'Cancel'}
                </button>
                <button
                  className="delete-button"
                  onClick={handleDeleteModel}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    intl.formatMessage({ id: 'yourmodel.confirmDelete' }) ||
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="name">
                  {intl.formatMessage({ id: 'yourmodel.modelName' }) ||
                    'Model Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedModel.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  {intl.formatMessage({ id: 'yourmodel.description' }) ||
                    'Description'}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editedModel.description || ''}
                  onChange={handleInputChange}
                  rows={5}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="is_public">
                  <input
                    type="checkbox"
                    id="is_public"
                    name="is_public"
                    checked={editedModel.is_public}
                    onChange={e =>
                      setEditedModel(prev => ({
                        ...prev,
                        is_public: e.target.checked,
                      }))
                    }
                  />
                  {intl.formatMessage({ id: 'yourmodel.public' }) ||
                    'Make model public'}
                </label>
              </div>

              <div className="action-buttons">
                <button
                  className="cancel-button"
                  onClick={handleCancelEditing}
                  disabled={isLoading}
                >
                  {intl.formatMessage({ id: 'yourmodel.cancel' }) || 'Cancel'}
                </button>
                <button
                  className="save-button"
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    intl.formatMessage({ id: 'yourmodel.saveChanges' }) ||
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="model-info">
                <div className="info-grid">
                  <div className="info-label">
                    {intl.formatMessage({ id: 'yourmodel.type' }) || 'Type'}:
                  </div>
                  <div className="info-value">
                    <span
                      className={`type-badge type-${model.type.toLowerCase()}`}
                    >
                      {model.type}
                    </span>
                  </div>

                  <div className="info-label">
                    {intl.formatMessage({ id: 'yourmodel.status' }) || 'Status'}
                    :
                  </div>
                  <div className="info-value">
                    <span
                      className={`status-badge ${getStatusClass(model.status)}`}
                    >
                      {getStatusLabel(model.status)}
                    </span>
                  </div>

                  <div className="info-label">
                    {intl.formatMessage({ id: 'yourmodel.accuracy' }) ||
                      'Accuracy'}
                    :
                  </div>
                  <div className="info-value">
                    {model.accuracy
                      ? `${(model.accuracy * 100).toFixed(2)}%`
                      : '-'}
                  </div>

                  <div className="info-label">
                    {intl.formatMessage({ id: 'yourmodel.author' }) || 'Author'}
                    :
                  </div>
                  <div className="info-value">
                    {model.user.name}
                    {model.user.id === userData?.id && (
                      <span className="text-gray-600 ml-1">(You)</span>
                    )}
                  </div>

                  <div className="info-label">
                    {intl.formatMessage({ id: 'yourmodel.createdAt' }) ||
                      'Created At'}
                    :
                  </div>
                  <div className="info-value">
                    {new Date(model.created_at).toLocaleTimeString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>

                  {model.updated_at && (
                    <>
                      <div className="info-label">
                        {intl.formatMessage({ id: 'yourmodel.updatedAt' }) ||
                          'Updated At'}
                        :
                      </div>
                      <div className="info-value">
                        {new Date(model.updated_at).toLocaleTimeString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </>
                  )}

                  <div className="info-label">
                    {intl.formatMessage({ id: 'yourmodel.classes' }) ||
                      'Classes'}
                    :
                  </div>
                  <div className="info-value">{model.num_classes || '-'}</div>

                  <div className="info-label">
                    {intl.formatMessage({ id: 'yourmodel.visibility' }) ||
                      'Visibility'}
                    :
                  </div>
                  <div className="info-value">
                    {model.is_public ? (
                      <span className="public-badge">Public</span>
                    ) : (
                      <span className="private-badge">Private</span>
                    )}
                  </div>
                </div>

                <div className="description-section">
                  <h3>
                    {intl.formatMessage({ id: 'yourmodel.description' }) ||
                      'Description'}
                  </h3>
                  <div className="description-content">
                    {model.description || (
                      <em>
                        {intl.formatMessage({
                          id: 'yourmodel.noDescription',
                        }) || 'No description available'}
                      </em>
                    )}
                  </div>
                </div>
              </div>

              {userData?.id === model.user?.id ? (
                <div className="action-buttons">
                  <button className="edit-button" onClick={handleStartEditing}>
                    {intl.formatMessage({ id: 'yourmodel.edit' }) || 'Edit'}
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    {intl.formatMessage({ id: 'yourmodel.delete' }) || 'Delete'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelDetailModal;
