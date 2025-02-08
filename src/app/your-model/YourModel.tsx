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
} from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

import { ListModel, RequestModelList } from '../request/mock';

let PageSize = 10;

function YourModel() {
  const [currentPage, setCurrentPage] = useState(1);
  const [listModel, setListModel] = useState<RequestModelList>({ Data: [] });
  const [isLoad, setIsLoad] = useState(false);
  const [description, setDescription] = useState('');
  const dispatch = useAppDispatch();

  const userData = useAppSelector(selectUser);
  let userId = '';
  if (userData) {
    userId = userData.id;
  }

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.yourmodel.title' });
    if (userData) {
      setIsLoad(true);
      let data = ListModel;
      setListModel(data);
      setTimeout(() => {
        setIsLoad(false);
      }, 1000);
    }
  }, [locale]);

  const handleShowDescription = (description: string) => {
    setDescription(description);
    dispatch(setIsOpenDescript(true));
  };

  const currentTableData = useMemo(() => {
    if (listModel.Data === null) return [];
    if (isLoad) return [];
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return listModel.Data.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, isLoad]);

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
          {userData && listModel.Data !== null ? (
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
                        <div className="row-data1">Ngày tạo</div>
                        <div className="row-data1">Tên mô hình</div>
                        <div className="row-data1">Trạng thái</div>
                        <div className="last-column">Thông tin</div>
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
                              className="body-button"
                              onClick={() =>
                                handleShowDescription(item.Description)
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
                        totalCount={
                          listModel.Data !== null ? listModel.Data.length : 0
                        }
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
