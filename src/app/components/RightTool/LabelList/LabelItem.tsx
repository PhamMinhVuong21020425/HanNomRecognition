import '@/app/scss/LabelItem.scss';
import { cloneDeep } from 'lodash';
import { Row, Col, Space, Button } from 'antd';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { LABEL_STATUS_TYPES } from '@/constants';
import {
  setCurrentShape,
  setLabelBoxStatus,
  setSelShapeIndex,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

type LabelItemProps = {
  index: number;
  label: string;
  visible: boolean;
};

function LabelItem(props: LabelItemProps) {
  const { index, label, visible } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);
  const { selDrawImageIndex, shapes, selShapeIndex } = state;

  const onItemClick = () => {
    dispatch(
      setSelShapeIndex({ selShapeIndex: index === selShapeIndex ? -1 : index })
    );
  };

  const onItemVisibleClick = () => {
    const shapesCopy = cloneDeep(shapes);
    shapesCopy[selDrawImageIndex][index].visible =
      !shapesCopy[selDrawImageIndex][index].visible;
    dispatch(setShapes({ shapes: shapesCopy }));
    if (index === selShapeIndex) {
      dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    }
  };

  const onItemEditClick = () => {
    dispatch(setCurrentShape({ currentShape: null }));
    dispatch(setSelShapeIndex({ selShapeIndex: index }));
    dispatch(
      setLabelBoxStatus({
        selLabelType: label,
        labelBoxVisible: true,
        labelBoxStatus: LABEL_STATUS_TYPES.UPDATE,
      })
    );
  };

  const onItemDeleteClick = () => {
    const shapesCopy = cloneDeep(shapes);
    shapesCopy[selDrawImageIndex].splice(index, 1);
    dispatch(setShapes({ shapes: shapesCopy }));
    if (index === selShapeIndex) {
      dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    } else if (index < selShapeIndex) {
      dispatch(setSelShapeIndex({ selShapeIndex: selShapeIndex - 1 }));
    }
  };

  return (
    <Row justify="space-between" style={{ padding: '8px 16px' }}>
      <Col xs={14}>
        <div
          title={label}
          onClick={onItemClick}
          className="label-item-name"
          style={{
            color: index === selShapeIndex ? '#ff4d4f' : '#000000d9',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <div style={{ padding: '0 10px' }}> #{index}</div>
          {label}
        </div>
      </Col>
      <Col xs={10} style={{ textAlign: 'end' }}>
        <Space>
          <Button
            size="small"
            shape="circle"
            title={visible ? 'Hide label' : 'Show label'}
            icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={onItemVisibleClick}
          />
          <Button
            type="primary"
            size="small"
            shape="circle"
            title="Edit label"
            icon={<EditOutlined />}
            onClick={onItemEditClick}
          />
          <Button
            type="primary"
            danger
            size="small"
            shape="circle"
            title="Delete label"
            icon={<DeleteOutlined />}
            onClick={onItemDeleteClick}
          />
        </Space>
      </Col>
    </Row>
  );
}

export default LabelItem;
