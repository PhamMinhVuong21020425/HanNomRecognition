'use client';
import '../scss/YourModel.scss';
import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import DescriptionModal from '../components/DescriptionModal';
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

let PageSize = 10;

function YourModel() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoad, setIsLoad] = useState(false);
  const [description, setDescription] = useState('');
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
    dispatch(getAllModelsAsync(userData.id));
  }, []);

  const handleShowDescription = (description: string) => {
    setDescription(description);
    dispatch(setIsOpenDescript(true));
  };

  const currentTableData = useMemo(() => {
    if (allModels === null) return [];
    if (isLoad) return [];
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return allModels.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, isLoad, allModels]);

  return (
    <div>
      <Header />
      {isLoad && (
        <div className="loading-animation">
          <Loading />
        </div>
      )}
      <div className="yourmodel-container">
        <div className="yourmodel-content">
          <div className="yourmodel-title">Mô hình của bạn</div>
          {userData && allModels ? (
            <div className="yourmodel-table">
              <div className="section">
                <div className="filter">
                  <div className="filter-form">
                    <div className="col1">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Từ khóa"
                      />
                    </div>
                    <div className="col1">
                      <select className="form-select" defaultValue={0}>
                        <option value="0">Trạng thái</option>
                        <option value="1">Chờ xử lý</option>
                        <option value="2">Đã duyệt</option>
                        <option value="3">Bị từ chối</option>
                      </select>
                    </div>
                    <div className="col1">
                      <button className="search-button" type="submit">
                        Tìm kiếm
                      </button>
                    </div>
                  </div>
                </div>
                <div className="table-content">
                  <div className="top-content">
                    <div className="table-header">
                      <div className="row">
                        <div className="row-data">#</div>
                        <div className="row-data1">Ngày tạo</div>
                        <div className="row-data1">Tên mô hình</div>
                        <div className="row-data1">Trạng thái</div>
                        <div className="last-column">Thông tin</div>
                      </div>
                    </div>
                    <div className="table-body">
                      {currentTableData.map((item, index) => {
                        return (
                          <div key={item.id} className="body-row">
                            <div className="body-row-data">
                              <span>{index + 1}</span>
                            </div>
                            <div className="body-row-data1">
                              <span>
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="body-row-data1">
                              <span>{item.name}</span>
                            </div>

                            <div className="body-row-data1">
                              <span>{item.status}</span>
                            </div>
                            <div
                              className="body-button"
                              onClick={() =>
                                handleShowDescription(item.description)
                              }
                            >
                              <a className="infor-link" role="button">
                                Mô tả
                              </a>
                            </div>
                          </div>
                        );
                      })}
                      <DescriptionModal description={description} />
                    </div>
                    <div className="pagination-container">
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={allModels ? allModels.length : 0}
                        pageSize={PageSize}
                        onPageChange={page => setCurrentPage(page)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="notuser">
              Bạn chưa có mô hình nào!{' '}
              <a href="/import" className="create-model">
                Tạo mô hình
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default YourModel;
