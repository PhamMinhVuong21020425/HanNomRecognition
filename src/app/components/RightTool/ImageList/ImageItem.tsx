import '@/app/scss/ImageItem.scss';
import { Row, Col, Checkbox, Space, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { DRAW_STATUS_TYPES } from '@/constants';
import {
  setImageFiles,
  setSelDrawImageIndex,
  setSelImageIndexes,
  setSelShapeIndex,
  setXmlPreviewBoxStatus,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

type ImageItemProps = {
  index: number;
  name: string;
};

function ImageItem(props: ImageItemProps) {
  const { index: fileIndex, name } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);
  const {
    imageFiles,
    selDrawImageIndex,
    selImageIndexes,
    imageSizes,
    drawStatus,
    shapes,
    selShapeIndex,
  } = state;

  const onCheckChange = (event: { target: { checked: boolean } }) => {
    const set = new Set([...selImageIndexes]);
    if (event.target.checked) set.add(fileIndex);
    else set.delete(fileIndex);
    dispatch(setSelImageIndexes({ selImageIndexes: [...set] }));
  };

  const onItemClick = () => {
    dispatch(setSelShapeIndex({ selShapeIndex: 0 }));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: fileIndex }));
  };

  const onXMLPreviewClick = () => {
    dispatch(
      setXmlPreviewBoxStatus({
        selPreviewIndex: fileIndex,
        xmlPreviewBoxVisible: true,
      })
    );
  };

  const onItemDeleteClick = () => {
    const newImageFiles = imageFiles.filter(
      (item, index) => index !== fileIndex
    );
    let newSelDrawImageIndex = selDrawImageIndex;
    if (newImageFiles.length === 0) {
      newSelDrawImageIndex = 0;
    } else if (fileIndex <= selDrawImageIndex && selDrawImageIndex !== 0) {
      newSelDrawImageIndex = selDrawImageIndex - 1;
    }
    dispatch(
      setImageFiles({
        imageFiles: newImageFiles,
        selDrawImageIndex: newSelDrawImageIndex,
        imageSizes: imageSizes.filter((item, index) => index !== fileIndex),
        drawStatus:
          fileIndex === selDrawImageIndex ? DRAW_STATUS_TYPES.IDLE : drawStatus,
        shapes: shapes.filter((item, index) => index !== fileIndex),
        selShapeIndex: fileIndex === selDrawImageIndex ? 0 : selShapeIndex,
      })
    );
  };

  return (
    <Row justify="space-between" style={{ padding: '8px 16px' }}>
      <Col xs={3}>
        <Checkbox
          checked={selImageIndexes.indexOf(fileIndex) !== -1}
          onChange={onCheckChange}
        />
      </Col>
      <Col xs={15}>
        <div
          title={name}
          onClick={onItemClick}
          className="file-item-name"
          style={{
            color: fileIndex === selDrawImageIndex ? '#ff4d4f' : '#000000d9',
          }}
        >
          {name}
        </div>
      </Col>
      <Col xs={6} style={{ textAlign: 'end' }}>
        <Space>
          <Button
            size="small"
            shape="circle"
            title={
              shapes[fileIndex]
                ? `Total labels: ${shapes[fileIndex].length}`
                : ''
            }
            onClick={onXMLPreviewClick}
          >
            {shapes[fileIndex] ? shapes[fileIndex].length : ''}
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            shape="circle"
            title="Delete file"
            icon={<DeleteOutlined />}
            onClick={onItemDeleteClick}
          />
        </Space>
      </Col>
    </Row>
  );
}

export default ImageItem;
