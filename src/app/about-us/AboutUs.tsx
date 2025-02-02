'use client';
import '../scss/AboutUs.scss';
import { useState, useEffect } from 'react';
import { Star, MessageCircle, Bug, Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAppSelector, selectLanguage } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

function AboutUs() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('review');

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.about-us.title' });
  }, [locale]);

  return (
    <div>
      <Header />
      <div className="container">
        <div className="aboutus-content">
          <div className="aboutus-header">Công cụ nhận diện chữ Hán - Nôm</div>
          <div className="context">
            <div className="left-context text-justify">
              <div className="text">
                Tiếng nói là khả năng bẩm sinh của con người, còn chữ viết là
                biểu thị cho nền văn minh của một đất nước, một phát minh sáng
                tạo của một dân tộc. Tiếng Việt diệu kì với ngữ âm cực kỳ phong
                phú cùng hệ thống chữ viết giàu mạnh nhất vùng Đông Á. Xuyên
                suốt chiều dài lịch sử, chữ viết nước ta đã trải qua hành trình
                từ chữ Hán hay chữ Nho đến chữ Nôm và cuối cùng là chữ Quốc Ngữ
                dựa trên hệ thống chữ Latin và đi cùng với mỗi loại chữ ấy là
                một trang sử vẻ vang đáng nhớ của dân tộc.
              </div>
              <div className="text">
                Sau khi Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng năm
                938, kết thúc nghìn năm Bắc thuộc, ông cha ta với ý thức tự chủ
                ngôn ngữ, đã sáng tạo ra chữ Nôm dựa trên cơ sở chữ Hán được đọc
                theo âm Hán-Việt, nên có thể nói chữ Hán là một tập con của chữ
                Nôm. Và trong hơn 1000 năm sau đó, từ thế kỷ 10 đến thế kỷ 20,
                song song với việc dùng chữ Hán, chữ Nôm được dùng để ghi lại
                phần lớn các tài liệu văn học, y học, triết học, tôn giáo, lịch
                sử văn hóa dân tộc. Tuy nhiên, di sản này hiện tại có nguy cơ
                tiêu vong bởi sự chuyển dịch sang loại chữ viết hiện đại hơn -
                chữ Quốc Ngữ.
              </div>
              <div className="text">
                Theo Hội Bảo tồn di sản chữ Nôm Việt Nam (Vietnamese Nôm
                Preservation Foundation - VNPF) thì: “Ngày nay, trên thế giới
                chưa có đến 100 người đọc được chữ Nôm. Một phần to tát của lịch
                sử Việt Nam như thế nằm ngoài tầm tay của 80 triệu người nói
                tiếng Việt”. Do giá trị to lớn của các tài liệu lịch sử đối với
                việc nghiên cứu, đặc biệt là các khía cạnh xã hội và lối sống
                thời trước cùng với những thông điệp mà cha ông để lại, việc bảo
                tồn di sản văn hóa này là cấp thiết.
              </div>
            </div>
            <div className="right-context">
              <img
                className="image rounded"
                src="https://cdn0.fahasa.com/media/catalog/product/z/2/z2470841796407_6e7ec53bafe59fd1c2d2114193a36799.jpg"
              />
            </div>
          </div>
          <div className="reason">
            <div className="top-reason">
              <div>
                <i>Dân ta phải biết sử ta</i>
              </div>
              <div>
                <i>Cho tường gốc tích nước nhà Việt Nam</i>
              </div>
              <div className="reference mt-2">
                {' '}
                (Trích “Việt Nam Quốc Sử Diễn Ca”, Hồ Chí Minh)
              </div>
            </div>
            <div className="bot-reason text-justify">
              <div>
                Lịch sử Việt Nam là lịch sử có chiều rộng, lại có chiều sâu, vì
                vậy Việt Nam không chỉ xanh hoa tốt lá mà còn mập gốc chắc rễ.
                Nền độc lập của cổ Việt đã được hoàn thành trong êm đẹp của thời
                bình nên nước Việt Nam chẳng khác gì một quả chín rụng ra khỏi
                cây mẹ để tự sống một cuộc đời riêng, mang đầy đủ sinh lực trong
                chính mình. Khi một cây đã mang đầy đủ sinh lực trong chính mình
                và đã có gốc mập rễ sâu thì một cành có thể bị gãy và rạn nứt,
                thân cây có thể bị đốn nhưng cây không sao chết được. Từ gốc nó,
                người ta sẽ thấy mầm nảy lên và cây sống lại.
              </div>
              <div>
                Với tình yêu cho những trang sử vẻ vang của dân tộc cùng khát
                khao cho cội nguồn hào hùng đó được tiếp tục duy trì và trở nên
                gần gũi hơn tới từng người Việt, chúng tôi đã xây dựng công cụ
                này một cách đầy tâm huyết cùng với niềm tự hào trên từng dòng
                chữ viết được và đó cũng như là một cách chúng tôi tỏ lòng mình
                với công lao của cha ông ngày trước.
              </div>
            </div>
          </div>
          <div className="goal">
            <div className="left-goal">
              <img src="/images/logo.png" width={'200px'} height={'200px'} />
            </div>
            <div className="right-goal">
              <div>
                Chúng tôi tập trung nghiên cứu vào quy trình xây dựng một bộ dữ
                liệu tốt, các kỹ thuật xử lý ảnh, xử lý ngôn ngữ tự nhiên, và
                các phương pháp học sâu để giải quyết 2 bài toán: phát hiện và
                nhận dạng các ký tự Hán-Nôm trong các văn bản lịch sử, tác phẩm
                văn học. Đồng thời xây dựng ứng dụng Web cùng bộ công cụ thao
                tác với các nhãn/bộ dữ liệu.
              </div>
            </div>
          </div>
          <a className="aboutus-review">Đánh giá - Báo lỗi</a>
          <div className="feedback-section">
            <div className="feedback-header">
              <h2 className="text-2xl font-bold text-center mb-6">
                Đánh giá - Báo lỗi
              </h2>
              <p className="text-center text-gray-900 mb-8">
                Chúng tôi luôn mong muốn nhận được những ý kiến đóng góp từ
                người dùng để cải thiện công cụ ngày càng tốt hơn
              </p>
            </div>

            <div className="feedback-type-selector">
              <button
                className={`flex items-center px-6 py-3 rounded-lg mr-4 ${
                  feedbackType === 'review'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFeedbackType('review')}
              >
                <MessageCircle className="mr-2" size={20} />
                Đánh giá
              </button>
              <button
                className={`flex items-center px-6 py-3 rounded-lg ${
                  feedbackType === 'bug'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFeedbackType('bug')}
              >
                <Bug className="mr-2" size={20} />
                Báo lỗi
              </button>
            </div>

            {feedbackType === 'review' && (
              <div className="rating-section my-6">
                <p className="text-gray-700 mb-3">
                  Bạn đánh giá như thế nào về công cụ của chúng tôi?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={32}
                      className={`cursor-pointer transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="feedback-form mt-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  {feedbackType === 'review'
                    ? 'Nội dung đánh giá'
                    : 'Mô tả lỗi'}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder={
                    feedbackType === 'review'
                      ? 'Chia sẻ trải nghiệm của bạn về công cụ...'
                      : 'Mô tả chi tiết lỗi bạn gặp phải...'
                  }
                />
              </div>

              {feedbackType === 'bug' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Các bước tái hiện lỗi
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Liệt kê các bước để tái hiện lỗi..."
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Email (không bắt buộc)
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email của bạn để chúng tôi có thể liên hệ khi cần..."
                />
              </div>

              <div className="info-box p-4 bg-blue-50 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  {feedbackType === 'review'
                    ? 'Đánh giá của bạn sẽ giúp chúng tôi cải thiện chất lượng công cụ và phục vụ cộng đồng tốt hơn.'
                    : 'Báo cáo lỗi của bạn sẽ được đội ngũ kỹ thuật xem xét và khắc phục trong thời gian sớm nhất.'}
                </p>
              </div>

              <button className="submit-button w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Send className="mr-2" size={20} />
                {feedbackType === 'review' ? 'Gửi đánh giá' : 'Gửi báo cáo lỗi'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AboutUs;
