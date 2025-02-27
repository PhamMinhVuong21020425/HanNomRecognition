import { Row, Col } from 'antd';
import ImageItem from './ImageItem';
import { useAppSelector } from '@/lib/redux';

function ImageList() {
  const state = useAppSelector(state => state.annotation);
  const { imageFiles } = state;

  return (
    <Row justify="start" style={{ overflow: 'auto' }}>
      {imageFiles.map((item, index) => (
        <Col key={item.name} xs={24}>
          <ImageItem index={index} name={`${item.name.split('$$').pop()}`} />
        </Col>
      ))}
    </Row>
  );
}

export default ImageList;
