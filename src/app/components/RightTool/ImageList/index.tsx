import { Row, Col } from 'antd';
import ImageItem from './ImageItem';
import { selectImageFiles, useAppSelector } from '@/lib/redux';

function ImageList() {
  const imageFiles = useAppSelector(selectImageFiles);

  return (
    <Row className="max-h-[250px]" justify="start" style={{ overflow: 'auto' }}>
      {imageFiles.map((item, index) => (
        <Col key={item.name} xs={24}>
          <ImageItem index={index} name={`${item.name.split('$$').pop()}`} />
        </Col>
      ))}
    </Row>
  );
}

export default ImageList;
