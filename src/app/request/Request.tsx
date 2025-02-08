'use client';
import '../scss/Request.scss';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDown } from '@fortawesome/free-solid-svg-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

import {
  useAppSelector,
  useAppDispatch,
  selectUser,
  selectLanguage,
} from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

import { ListModel, RequestModelList } from '../request/mock';

let PageSize = 20;
function RequestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [listModel, setListModel] = useState<RequestModelList>({ Data: [] });
  const [isLoad, setIsLoad] = useState(false);
  const dispatch = useAppDispatch();

  const userData = useAppSelector(selectUser);

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.request.title' });
    if (userData) {
      setIsLoad(true);
      setListModel(ListModel);
      setTimeout(() => {
        setIsLoad(false);
      }, 1000);
    }
  }, [locale]);

  const currentTableData = useMemo(() => {
    if (isLoad) return [];
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return listModel.Data.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, isLoad]);

  const handleDownloadModel = (content: string | Blob) => {
    saveAs(content, `application.zip`);
  };

  const handleOnAccept = async (model_id: string) => {
    setIsLoad(true);
    setTimeout(() => {
      setIsLoad(false);
    }, 1000);
  };
  const handleOnReject = async (model_id: string) => {
    setIsLoad(true);
    setTimeout(() => {
      setIsLoad(false);
    }, 1000);
  };
  const handleOnDelete = async (model_id: string) => {
    setIsLoad(true);
    setTimeout(() => {
      setIsLoad(false);
    }, 1000);
  };

  return (
    <div>
      <Header />
      <div className="request-container">
        <div className="request-content">
          <div className="request-title">Danh sách yêu cầu</div>
          {userData && listModel.Data !== null ? (
            <div className="request-table">
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
                      <select className="form-select">
                        <option value="0" selected>
                          Trạng thái
                        </option>
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
                        <div className="row-data1">Họ tên</div>
                        <div className="row-data1">Tên mô hình</div>
                        <div className="row-data1">Trạng thái</div>
                        <div className="row-data1">Tải về</div>
                        <div className="row-data1">Duyệt</div>
                      </div>
                    </div>
                    <div className="table-body">
                      {currentTableData.map((item, index) => {
                        return (
                          <div className="body-row">
                            <div className="body-row-data">
                              <span>{index + 1}</span>
                            </div>
                            <div className="body-row-data1">
                              <span>{item.Date}</span>
                            </div>

                            <div className="body-row-data1">
                              <span>{item.Name}</span>
                            </div>

                            <div className="body-row-data1">
                              <span>{item.Status}</span>
                            </div>
                            <div
                              className="body-row-data1"
                              onClick={() => handleDownloadModel(item.Content)}
                            >
                              <span>
                                <FontAwesomeIcon
                                  className="download"
                                  icon={faCircleDown}
                                />
                              </span>
                            </div>
                            {item.Status === 'Chờ xử lý' ? (
                              <div className="body-button">
                                <button
                                  className="ok-button"
                                  onClick={() => handleOnAccept(item.Model_id)}
                                >
                                  Đồng ý
                                </button>
                                <button
                                  className="reject-button"
                                  onClick={() => handleOnReject(item.Model_id)}
                                >
                                  Từ chối
                                </button>
                              </div>
                            ) : (
                              <div className="body-button">
                                <button
                                  className="reject-button"
                                  onClick={() => handleOnDelete(item.Model_id)}
                                >
                                  Xóa yêu cầu
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="pagination-container">
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={listModel.Data.length}
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
              Chỉ Quản trị viên mới có thể phê duyệt yêu cầu!
            </div>
          )}
        </div>
        {isLoad && (
          <div className="loading-animation">
            <Loading />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default RequestPage;
