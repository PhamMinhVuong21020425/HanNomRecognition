'use client';
import '../scss/YourModel.scss';
import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import ModelDetailModal from '../components/ModelDetailModal';
import {
  useAppDispatch,
  useAppSelector,
  setIsOpenDescript,
  selectUser,
  selectLanguage,
  selectAllModels,
  getAllModelsAsync,
} from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

import { Model } from '@/entities/model.entity';

const PageSize = 10;

const YourModel: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoad, setIsLoad] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);

  const dispatch = useAppDispatch();

  const userData = useAppSelector(selectUser);
  const allModels = useAppSelector(selectAllModels);

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.yourmodel.title' });
  }, [locale]);

  useEffect(() => {
    if (!userData) return;
    setIsLoad(true);
    dispatch(getAllModelsAsync(userData.id))
      .then(() => setIsLoad(false))
      .catch(() => setIsLoad(false));
  }, [dispatch, userData]);

  useEffect(() => {
    if (!allModels) return;
    filterModels();
  }, [allModels, searchTerm]);

  const filterModels = () => {
    if (!allModels) return;

    if (!searchTerm.trim()) {
      setFilteredModels(allModels);
      return;
    }

    const filtered = allModels.filter(
      model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredModels(filtered);
  };

  const handleShowModelDetails = (model: Model) => {
    setSelectedModel(model);
    dispatch(setIsOpenDescript(true));
  };

  const currentTableData = useMemo(() => {
    if (filteredModels.length === 0) return [];
    if (isLoad) return [];

    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredModels.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, isLoad, filteredModels]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="model-page">
      <Header />
      {isLoad && (
        <div className="loading-overlay">
          <Loading />
        </div>
      )}
      <div className="model-container">
        <div className="model-content">
          <div className="model-header">
            <h1 className="model-title">
              {intl.formatMessage({ id: 'homeheader.yourmodel' }) ||
                'Your Models'}
            </h1>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={
                  intl.formatMessage({ id: 'yourmodel.search' }) ||
                  'Search models...'
                }
                value={searchTerm}
                onChange={handleSearch}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {userData && allModels ? (
            <>
              {filteredModels.length > 0 ? (
                <div className="model-table">
                  <div className="table-header">
                    <div className="header-row">
                      <div className="col-index">#</div>
                      <div className="col-date">
                        {intl.formatMessage({ id: 'yourmodel.createdAt' }) ||
                          'Created At'}
                      </div>
                      <div className="col-name">
                        {intl.formatMessage({ id: 'yourmodel.modelName' }) ||
                          'Model Name'}
                      </div>
                      <div className="col-type">
                        {intl.formatMessage({ id: 'yourmodel.type' }) || 'Type'}
                      </div>
                      <div className="col-accuracy">
                        {intl.formatMessage({ id: 'yourmodel.accuracy' }) ||
                          'Accuracy'}
                      </div>
                      <div className="col-actions">
                        {intl.formatMessage({ id: 'yourmodel.actions' }) ||
                          'Actions'}
                      </div>
                    </div>
                  </div>

                  <div className="table-body">
                    {currentTableData.map((model, index) => (
                      <div key={model.id} className="table-row">
                        <div className="col-index">
                          {(currentPage - 1) * PageSize + index + 1}
                        </div>
                        <div className="col-date">
                          {formatDate(model.created_at)}
                        </div>
                        <div className="col-name" title={model.name}>
                          {model.name}
                        </div>
                        <div className="col-type">
                          <span
                            className={`type-badge type-${model.type.toLowerCase()}`}
                          >
                            {model.type}
                          </span>
                        </div>
                        <div className="col-accuracy">
                          {model.accuracy
                            ? `${(model.accuracy * 100).toFixed(2)}%`
                            : '-'}
                        </div>
                        <div className="col-actions">
                          <button
                            className="action-button view-button"
                            onClick={() => handleShowModelDetails(model)}
                          >
                            {intl.formatMessage({
                              id: 'yourmodel.viewDetails',
                            }) || 'View Details'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredModels.length > PageSize && (
                    <div className="pagination-wrapper">
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={filteredModels.length}
                        pageSize={PageSize}
                        onPageChange={page => setCurrentPage(page)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-results">
                  {intl.formatMessage({ id: 'noModelsFound' }) ||
                    'No models found matching your search.'}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h2>
                {intl.formatMessage({ id: 'noModelsYet' }) ||
                  "You don't have any models yet!"}
              </h2>
              <p>
                {intl.formatMessage({ id: 'createModelPrompt' }) ||
                  'Create your first model to get started.'}
              </p>
              <a href="/import" className="create-model-button">
                {intl.formatMessage({ id: 'createModel' }) || 'Create Model'}
              </a>
            </div>
          )}
        </div>
      </div>
      {selectedModel && <ModelDetailModal model={selectedModel} />}
      <Footer />
    </div>
  );
};

export default YourModel;
