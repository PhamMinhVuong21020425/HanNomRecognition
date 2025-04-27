'use client';
import '../scss/Request.scss';
import axios from '@/lib/axios';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAs } from 'file-saver';
import { message, Modal } from 'antd';
import { FolderX } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleDown,
  faSearch,
  faTrash,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

import {
  useAppSelector,
  selectUser,
  selectLanguage,
  useAppDispatch,
  setSelDataset,
  setImagesRedux,
  setSelDrawImageIndex,
} from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import { TrainingJob } from '@/entities/training_job.entity';
import { TrainingJobStatus } from '@/enums/TrainingJobStatus';

import { Dataset } from '@/entities/dataset.entity';
import { ImageType } from '@/types/ImageType';
import { getObjectUrlFromPath } from '@/utils/general';
import { ProblemType } from '@/enums/ProblemType';

const PageSize = 5;

function RequestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [listJob, setListJob] = useState<TrainingJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<TrainingJob[]>([]);
  const [isLoad, setIsLoad] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();
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
        const response = await axios.get(`/be/jobs/${userData.id}`);
        setListJob(response.data);
        setFilteredJobs(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoad(false);
      }
    };
    fetchData();
  }, [userData]);

  // Filter jobs when search or status filter changes
  useEffect(() => {
    if (!listJob.length) return;

    const filtered = listJob.filter(job => {
      const matchesKeyword =
        searchKeyword === '' ||
        job.model?.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.strategy?.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchesStatus = statusFilter === '' || job.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchKeyword, statusFilter, listJob]);

  const currentTableData = useMemo(() => {
    if (isLoad) return [];
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredJobs.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, isLoad, filteredJobs]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleGoDataset = async (dataset: Dataset) => {
    setIsLoad(true);
    dispatch(setSelDataset(dataset));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: -1 }));

    try {
      const response = await axios.get(`/be/datasets/${dataset.id}/images`);
      const images = response.data ?? [];

      const imagesOfDataset: ImageType[] = [];
      for (const img of images) {
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
    } catch (error) {
      console.error('Error fetching dataset images:', error);
      setIsLoad(false);
    }
  };

  const handleDownloadModel = async (path: string) => {
    setIsLoad(true);
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

  const handleOnDelete = (jobId: string) => {
    if (!userData) return;
    const confirmDelete = async (jobId: string) => {
      try {
        const response = await axios.post('/be/jobs/delete', {
          id: jobId,
        });
        if (response.data.success) {
          setListJob(prevJobs => prevJobs.filter(job => job.id !== jobId));
          setFilteredJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        } else {
          message.error('Xóa yêu cầu không thành công.');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    };

    Modal.confirm({
      title: 'Confirm Delete',
      content:
        'Are you sure you want to delete this request? This action cannot be undone.',
      okType: 'danger',
      centered: true,
      closable: true,
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk: () => confirmDelete(jobId),
    });
  };

  return (
    <div>
      <Header />
      <div className="request-container">
        <div className="request-content">
          <h1 className="request-title">Danh sách yêu cầu</h1>

          {userData && listJob ? (
            <div className="request-card">
              <div className="section">
                <div className="filter-section">
                  <div className="filter-form">
                    <div className="input-wrapper">
                      <select
                        className="custom-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value={TrainingJobStatus.PENDING}>
                          Chờ xử lý
                        </option>
                        <option value={TrainingJobStatus.INPROGRESS}>
                          Đang xử lý
                        </option>
                        <option value={TrainingJobStatus.COMPLETED}>
                          Đã hoàn thành
                        </option>
                        <option value={TrainingJobStatus.FAILED}>
                          Thất bại
                        </option>
                      </select>
                      <div className="input-icon">
                        <FontAwesomeIcon icon={faFilter} />
                      </div>
                    </div>

                    <div className="input-wrapper">
                      <input
                        className="custom-input"
                        type="text"
                        placeholder="Tìm kiếm theo tên mô hình"
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                      />
                      <div className="input-icon" onClick={handleSearch}>
                        <FontAwesomeIcon icon={faSearch} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <div className="table-row">
                      <div className="col-index">#</div>
                      <div className="col-center">Ngày tạo</div>
                      <div className="col-center">Ngày hoàn thành</div>
                      <div className="col-left">Mô hình/Chiến lược</div>
                      <div className="col-left">Tập dữ liệu</div>
                      <div className="col-center">Trạng thái</div>
                      <div className="col-actions">Thao tác</div>
                    </div>
                  </div>

                  <div className="table-body">
                    {currentTableData.length > 0 ? (
                      currentTableData.map((item, index) => (
                        <div key={item.id} className="table-row">
                          <div className="col-index">
                            {(currentPage - 1) * PageSize + index + 1}
                          </div>

                          <div className="col-center">
                            <div className="date-display">
                              <span className="date-primary">
                                {formatDate(item.created_at)}
                              </span>
                              <span className="date-time">
                                {new Date(item.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          <div className="col-center">
                            <div className="date-display">
                              <span className="date-primary">
                                {formatDate(item.completed_at)}
                              </span>
                              <span className="date-time">
                                {new Date(
                                  item.completed_at
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          <div
                            className="col-left"
                            title={item.model ? item.model.name : item.strategy}
                          >
                            <span className="text-ellipsis">
                              {item.model ? (
                                item.model.name
                              ) : (
                                <span className="text-orange-600">
                                  {item.strategy}
                                </span>
                              )}
                            </span>
                          </div>

                          <div
                            className="col-left"
                            title={item.dataset ? item.dataset.name : '—'}
                          >
                            <span className="text-ellipsis">
                              {item.dataset ? (
                                <span
                                  className="hover:text-blue-500 hover:cursor-pointer"
                                  onClick={() => handleGoDataset(item.dataset)}
                                >
                                  {item.dataset.name}
                                </span>
                              ) : (
                                '—'
                              )}
                            </span>
                          </div>

                          <div className="col-center">
                            <span className={`status-badge ${item.status}`}>
                              {item.status === TrainingJobStatus.PENDING
                                ? 'Chờ xử lý'
                                : item.status === TrainingJobStatus.INPROGRESS
                                  ? 'Đang xử lý'
                                  : item.status === TrainingJobStatus.COMPLETED
                                    ? 'Đã hoàn thành'
                                    : 'Thất bại'}
                            </span>
                          </div>

                          <div className="col-actions">
                            <button
                              className={`action-button download-button text-gray-500 ${
                                item.status === TrainingJobStatus.COMPLETED &&
                                item.result_path
                                  ? ''
                                  : 'disabled'
                              }`}
                              onClick={() => {
                                if (
                                  item.status === TrainingJobStatus.COMPLETED &&
                                  item.result_path
                                ) {
                                  handleDownloadModel(item.result_path);
                                }
                              }}
                              title="Tải về"
                              disabled={
                                !(
                                  item.status === TrainingJobStatus.COMPLETED &&
                                  item.result_path
                                )
                              }
                            >
                              <FontAwesomeIcon icon={faCircleDown} />
                            </button>

                            <button
                              className="action-button delete-button"
                              onClick={() => handleOnDelete(item.id)}
                              title="Xóa yêu cầu"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>Không có dữ liệu phù hợp với điều kiện tìm kiếm</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pagination-wrapper">
                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={filteredJobs.length}
                    pageSize={PageSize}
                    onPageChange={page => setCurrentPage(page)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 mx-auto my-8 max-w-md">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-50 rounded-full">
                <FolderX className="w-8 h-8 text-blue-600" />
              </div>

              <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                Không có dữ liệu
              </h3>

              <div className="text-center text-lg mb-6 text-gray-600">
                <p>
                  Bạn cần{' '}
                  <button
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                    onClick={() => router.push('/auth/login')}
                  >
                    đăng nhập
                  </button>{' '}
                  để có quyền truy cập vào Danh sách yêu cầu.
                </p>
              </div>
            </div>
          )}
        </div>

        {isLoad && (
          <div className="loading-overlay">
            <Loading />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default RequestPage;
