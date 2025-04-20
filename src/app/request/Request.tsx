'use client';
import '../scss/Request.scss';
import axios from 'axios';
import request from '@/lib/axios';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDown } from '@fortawesome/free-solid-svg-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

import { useAppSelector, selectUser, selectLanguage } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import { TrainingJob } from '@/entities/training_job.entity';

const PageSize = 10;

function RequestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [listJob, setListJob] = useState<TrainingJob[]>([]);
  const [isLoad, setIsLoad] = useState(false);

  const userData = useAppSelector(selectUser);

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.request.title' });
  }, [locale]);

  useEffect(() => {
    if (!userData) return;
    const fetchData = async () => {
      setIsLoad(true);
      try {
        const response = await request.get(`/be/jobs/${userData.id}`);
        setListJob(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoad(false);
      }
    };
    fetchData();
  }, []);

  const currentTableData = useMemo(() => {
    if (isLoad) return [];
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return listJob.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, isLoad]);

  const handleDownloadModel = async (path: string) => {
    setIsLoad(true);
    console.log('path', path);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_FLASK_API}/api/file/download`,
        {
          file_path: path,
        },
        {
          withCredentials: true,
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract filename from Content-Disposition header if available
      let filename = 'downloaded-file';
      const disposition = response.headers['content-disposition'];
      if (disposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Fallback to extracting filename from the path if header doesn't contain it
      if (filename === 'downloaded-file') {
        const pathParts = path.replace(/\\/g, '/').split('/');
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart) filename = lastPart;
        }
      }

      const contentType =
        response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });

      saveAs(blob, filename);

      console.log('File downloaded successfully:', filename);
    } catch (error) {
      console.error('Error downloading model:', error);
    } finally {
      setIsLoad(false);
    }
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
          {userData && listJob ? (
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
                        <div className="row-data1">Tải về</div>
                        <div className="row-data1">Duyệt</div>
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
                              <span>
                                {item.model ? item.model.name : item.strategy}
                              </span>
                            </div>

                            <div className="body-row-data1">
                              <span>{item.status}</span>
                            </div>
                            <div
                              className="body-row-data1"
                              onClick={() =>
                                handleDownloadModel(item.result_path)
                              }
                            >
                              <span>
                                <FontAwesomeIcon
                                  className="download"
                                  icon={faCircleDown}
                                />
                              </span>
                            </div>
                            <div className="body-button">
                              <button
                                className="reject-button"
                                onClick={() => handleOnDelete(item.model?.id)}
                              >
                                Xóa yêu cầu
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pagination-container">
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={listJob.length}
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
