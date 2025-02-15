import { Row, Col } from 'antd';
import LabelItem from './LabelItem';
import { useAppSelector } from '@/lib/redux';

function LabelList() {
  const state = useAppSelector(state => state.annotation);
  const { selDrawImageIndex, shapes } = state;

  return (
    <Row justify="start" style={{ overflow: 'auto' }}>
      {shapes[selDrawImageIndex] &&
        Array.isArray(shapes[selDrawImageIndex]) &&
        shapes[selDrawImageIndex].map((item, index) => (
          <Col key={item.d} xs={24}>
            <LabelItem
              index={index}
              label={item.label}
              visible={item.visible}
            />
          </Col>
        ))}
    </Row>
  );
}

export default LabelList;
