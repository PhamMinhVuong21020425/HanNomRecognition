'use client';
import '../scss/Documentation.scss';
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Code,
  Upload,
  Download,
  Coffee,
  Terminal,
} from 'lucide-react';
import { RiCharacterRecognitionLine } from 'react-icons/ri';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAppSelector, selectLanguage } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.documentation.title' });
  }, [locale]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="documentation-page">
      <Header />
      <div className="documentation-section">
        <div className="documentation-hero">
          <div className="container mx-auto px-4 py-8">
            <h1 className="documentation-header">Tài liệu hướng dẫn sử dụng</h1>
            <p>
              Tìm hiểu cách sử dụng công cụ nhận diện chữ Hán-Nôm một cách hiệu
              quả
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="documentation-content flex">
            {/* Sidebar Navigation */}
            <nav className="documentation-nav w-64 pr-8">
              <div className="sticky top-36">
                <div className="nav-section mb-6">
                  <h3 className="text-lg font-semibold mb-3">Bắt đầu</h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#getting-started"
                        onClick={() => scrollToSection('getting-started')}
                        className={`nav-link ${activeSection === 'getting-started' ? 'active' : ''}`}
                      >
                        <BookOpen size={16} className="mr-2" />
                        Giới thiệu
                      </a>
                    </li>
                    <li>
                      <a
                        href="#quick-start"
                        onClick={() => scrollToSection('quick-start')}
                        className={`nav-link ${activeSection === 'quick-start' ? 'active' : ''}`}
                      >
                        <Terminal size={16} className="mr-2" />
                        Hướng dẫn nhanh
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="nav-section mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Tính năng chính
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#upload"
                        onClick={() => scrollToSection('upload')}
                        className={`nav-link ${activeSection === 'upload' ? 'active' : ''}`}
                      >
                        <Upload size={16} className="mr-2" />
                        Tải lên hình ảnh
                      </a>
                    </li>
                    <li>
                      <a
                        href="#recognition"
                        onClick={() => scrollToSection('recognition')}
                        className={`nav-link ${activeSection === 'recognition' ? 'active' : ''}`}
                      >
                        <RiCharacterRecognitionLine
                          size={16}
                          className="mr-2"
                        />
                        Nhận diện ký tự
                      </a>
                    </li>
                    <li>
                      <a
                        href="#export"
                        onClick={() => scrollToSection('export')}
                        className={`nav-link ${activeSection === 'export' ? 'active' : ''}`}
                      >
                        <Download size={16} className="mr-2" />
                        Xuất kết quả
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="nav-section">
                  <h3 className="text-lg font-semibold mb-3">Nâng cao</h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#api"
                        onClick={() => scrollToSection('api')}
                        className={`nav-link ${activeSection === 'api' ? 'active' : ''}`}
                      >
                        <Code size={16} className="mr-2" />
                        API Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="#contribute"
                        onClick={() => scrollToSection('contribute')}
                        className={`nav-link ${activeSection === 'contribute' ? 'active' : ''}`}
                      >
                        <Coffee size={16} className="mr-2" />
                        Đóng góp
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <div className="documentation-main flex-1">
              {/* Getting Started Section */}
              <section id="getting-started" className="doc-section">
                <h2 className="text-3xl font-bold mb-6">Giới thiệu</h2>
                <p className="mb-4">
                  Công cụ nhận diện chữ Hán-Nôm là một ứng dụng web hiện đại
                  giúp chuyển đổi các văn bản chữ Hán-Nôm sang dạng số một cách
                  nhanh chóng và chính xác.
                </p>
                <div className="feature-grid grid grid-cols-2 gap-6 my-8">
                  <div className="feature-card">
                    <h3 className="text-xl font-semibold mb-3">
                      Nhận diện chính xác
                    </h3>
                    <p>
                      Sử dụng AI tiên tiến để nhận diện ký tự với độ chính xác
                      cao
                    </p>
                  </div>
                  <div className="feature-card">
                    <h3 className="text-xl font-semibold mb-3">
                      Xử lý nhanh chóng
                    </h3>
                    <p>
                      Tối ưu hóa hiệu suất để xử lý văn bản trong thời gian ngắn
                    </p>
                  </div>
                </div>
              </section>

              {/* Quick Start Section */}
              <section id="quick-start" className="doc-section">
                <h2 className="text-3xl font-bold mb-6">Hướng dẫn nhanh</h2>
                <div className="steps space-y-6">
                  <div className="step-item">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3 className="text-xl font-semibold mb-2">
                        Tải lên hình ảnh
                      </h3>
                      <p>
                        Chọn và tải lên hình ảnh văn bản Hán-Nôm cần nhận diện
                      </p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3 className="text-xl font-semibold mb-2">
                        Chọn vùng nhận diện
                      </h3>
                      <p>
                        Điều chỉnh vùng chọn để tập trung vào phần văn bản cần
                        nhận diện
                      </p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3 className="text-xl font-semibold mb-2">
                        Nhận kết quả
                      </h3>
                      <p>
                        Xem, chỉnh sửa và tải về kết quả nhận diện dưới nhiều
                        định dạng
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Sections */}
              <section id="upload" className="doc-section">
                <h2 className="text-3xl font-bold mb-6">Tải lên hình ảnh</h2>
                <div className="feature-content">
                  <h3 className="text-xl font-semibold mb-4">
                    Các định dạng hỗ trợ
                  </h3>
                  <ul className="list-disc pl-6 mb-6">
                    <li>JPEG, JPG (khuyến nghị)</li>
                    <li>PNG</li>
                    <li>TIFF</li>
                    <li>BMP</li>
                  </ul>
                  <div className="info-box bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Lưu ý:</strong> Để có kết quả tốt nhất, hình ảnh
                      nên có độ phân giải tối thiểu 300dpi và kích thước tệp
                      không quá 10MB.
                    </p>
                  </div>
                </div>
              </section>

              <section id="recognition" className="doc-section">
                <h2 className="text-3xl font-bold mb-6">Nhận diện ký tự</h2>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Quy trình nhận diện
                  </h3>
                  <ol className="list-decimal pl-6 space-y-4">
                    <li>Tiền xử lý hình ảnh</li>
                    <li>Phân đoạn văn bản</li>
                    <li>Nhận diện ký tự</li>
                    <li>Hậu xử lý và kiểm tra</li>
                  </ol>
                </div>
                <div className="tips-box bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Mẹo cải thiện kết quả</h4>
                  <ul className="list-disc pl-6">
                    <li>Đảm bảo hình ảnh rõ nét và đủ sáng</li>
                    <li>Chụp thẳng, tránh góc nghiêng</li>
                    <li>Điều chỉnh vùng chọn chính xác</li>
                  </ul>
                </div>
              </section>

              <section id="export" className="doc-section">
                <h2 className="text-3xl font-bold mb-6">Xuất kết quả</h2>
                <div className="export-formats grid grid-cols-2 gap-6">
                  <div className="format-card">
                    <h3 className="text-xl font-semibold mb-3">
                      Văn bản thuần túy
                    </h3>
                    <p>
                      Kết quả dạng text đơn giản, dễ dàng sao chép và chỉnh sửa
                    </p>
                  </div>
                  <div className="format-card">
                    <h3 className="text-xl font-semibold mb-3">
                      PDF có thể tìm kiếm
                    </h3>
                    <p>File PDF với layer text có thể tìm kiếm và sao chép</p>
                  </div>
                </div>
              </section>

              {/* Advanced Sections */}
              <section id="api" className="doc-section">
                <h2 className="text-3xl font-bold mb-6">API Documentation</h2>
                <div className="api-docs">
                  <h3 className="text-xl font-semibold mb-4">
                    REST API Endpoints
                  </h3>
                  <div className="code-block bg-gray-900 text-white p-4 rounded-lg mb-6">
                    <pre>
                      <code>
                        POST /api/v1/recognize Content-Type: multipart/form-data
                      </code>
                    </pre>
                  </div>
                  <p className="mb-4">
                    API cho phép tích hợp công cụ nhận diện vào ứng dụng của
                    bạn. Xem tài liệu chi tiết để biết thêm thông tin.
                  </p>
                </div>
              </section>

              <section id="contribute" className="doc-section">
                <h2 className="text-3xl font-bold mb-6">Đóng góp</h2>
                <p className="mb-4">
                  Chúng tôi luôn chào đón sự đóng góp từ cộng đồng để cải thiện
                  công cụ. Bạn có thể đóng góp theo nhiều cách:
                </p>
                <ul className="list-disc pl-6">
                  <li>Báo cáo lỗi và đề xuất tính năng mới</li>
                  <li>Cải thiện tài liệu</li>
                  <li>Chia sẻ dữ liệu mẫu</li>
                  <li>Tham gia phát triển</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Documentation;
