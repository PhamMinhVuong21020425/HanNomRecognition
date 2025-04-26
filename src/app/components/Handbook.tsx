import '../scss/Handbook.scss';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Handbook() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1023, // tablet breakpoint
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 739, // mobile breakpoint
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="section-specialty">
      <div className="specialty-content">
        <div className="specialty-body">
          <Slider {...settings}>
            <a
              href="https://aws.amazon.com/vi/what-is/ocr/"
              className="img-custom"
              target="blank"
            >
              <img
                className="slide1"
                src="https://businesswiki.codx.vn/wp-content/uploads/2023/06/ocr-la-gi-2.jpg"
                alt=""
              />
              <div className="slide-title">OCR là gì & Điều cần biết</div>
            </a>
            <a
              className="img-custom"
              href="https://pixta.vn/data-annotation-la-gi"
              target="blank"
            >
              <img
                className="slide1"
                src="https://oasisoutsourcing.co.ke/wp-content/uploads/2022/06/software-engineer-statistician-visualizer-analyst-working-project-big-data-conference-big-data-presentation-data-science-concept_335657-1850-1.webp"
                alt=""
              />
              <div className="slide-title">Data annotation - Dữ liệu?</div>
            </a>
            <a
              className="img-custom"
              href="https://aws.amazon.com/vi/what-is/data-labeling/"
              target="blank"
            >
              <img
                className="slide1"
                src="https://storage.googleapis.com/fastwork-static/bd6c1b6d-317a-4539-beb9-b67f384a73ab.jpg"
                alt=""
              />
              <div className="slide-title">Labeling concepts</div>
            </a>
            <a
              className="img-custom"
              href="https://www.ibm.com/topics/deep-learning"
              target="blank"
            >
              <img
                className="slide1"
                src="https://www.salesforce.com/eu/blog/wp-content/uploads/sites/14/2023/09/deep-learning-ai-business.jpg"
                alt=""
              />
              <div className="slide-title">Học sâu - Deep learning</div>
            </a>
            <a
              className="img-custom"
              href="https://albumentations.ai/docs/getting_started/bounding_boxes_augmentation/"
              target="blank"
            >
              <img
                className="slide1"
                src="https://raw.githubusercontent.com/EckoTan0804/upic-repo/master/uPic/annotation-convertion-COCO-and-YOLO.png"
                alt=""
              />
              <div className="slide-title">Coco format</div>
            </a>
            <a
              className="img-custom"
              href="https://viblo.asia/p/tim-hieu-ve-yolo-trong-bai-toan-real-time-object-detection-yMnKMdvr57P"
              target="blank"
            >
              <img
                className="slide1"
                src="https://images.viblo.asia/1a2ee016-c5ec-447a-bea2-a27e75e1f352.png"
                alt=""
              />
              <div className="slide-title">Yolo format</div>
            </a>
          </Slider>
        </div>
      </div>
    </div>
  );
}

export default Handbook;
