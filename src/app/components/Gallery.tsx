import '../scss/Gallery.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { FormattedMessage } from 'react-intl';

function Gallery() {
  let settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="gallery-container">
      <div className="gallery-content">
        <div className="gallery-header font-sans">
          <FormattedMessage id="gallery.title" />
        </div>

        <div className="slick-list">
          <Slider {...settings}>
            <div className="gallery-grid-tab">
              <div className="gallery-grid">
                <div className="gallery-col">
                  <img
                    className="image1"
                    src="https://holylandvietnamstudies.com/wp-content/uploads/2020/03/kim-van-kieu-tan-truyen-hanoi-1894.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8AlRr12ml3h1D5E-V86OcR8yscLkxHmE_n2HrJqm295PYlly5-ysGrh_EaNiLow5nglc&usqp=CAU"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://raw.githubusercontent.com/ds4v/NomNaOCR/main/Assets/labeling.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://raw.githubusercontent.com/ds4v/NomNaOCR/main/Assets/nomnanmt.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img className="image" src="/images/gallery.png" />
                </div>
              </div>
            </div>
            <div className="gallery-grid-tab">
              <div className="gallery-grid">
                <div className="gallery-col">
                  <img
                    className="image1"
                    src="https://thanhdiavietnamhoc.com/wp-content/uploads/2020/03/han-thuyen-nom-van-te-ca-sau-thanhdiavietnamhoc.com_.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://thanhnien.mediacdn.vn/Uploaded/congson/2022_07_21/nguyen-dinh-chieu-2-7552.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://thanhnien.mediacdn.vn/Uploaded/nhanlh/2022_04_22/img-4963-4038.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://picx.zhimg.com/v2-2ecae3d442e1c2b6d56a25d6a8dbdd43_720w.jpg?source=172ae18b"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://photo-cms-vovworld.zadn.vn/w500/Uploaded/vovworld/znaeng/2022_09_17/quocamthitap-nguontapchitaodan_CVQM.jpg"
                  />
                </div>
              </div>
            </div>
            <div className="gallery-grid-tab">
              <div className="gallery-grid">
                <div className="gallery-col">
                  <img
                    className="image1"
                    src="https://vcdn-vnexpress.vnecdn.net/2020/09/30/VNE-Old-8850-1601460912.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://images2.thanhnien.vn/zoom/700_438/Uploaded/congson/2022_07_21/20220707-143041-1043.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://thanhnien.mediacdn.vn/Uploaded/congson/2022_07_21/nguyen-dinh-chieu-4-6973.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://cdn-i.vtcnews.vn/resize/th/upload/2020/09/27/truyen-kieu-nguyen-du-06575383.jpg"
                  />
                </div>
                <div className="gallery-col1">
                  <img
                    className="image"
                    src="https://images2.thanhnien.vn/Uploaded/congson/2022_06_30/luc-van-tien-01-2-6611.jpg"
                  />
                </div>
              </div>
            </div>
          </Slider>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
