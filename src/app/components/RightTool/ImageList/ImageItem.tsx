import '@/app/scss/ImageItem.scss';
import { shallowEqual } from 'react-redux';
import { CheckCircle } from 'lucide-react';
import { Row, Col, Checkbox, Space, Button, CheckboxChangeEvent } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { DRAW_STATUS_TYPES } from '@/constants';
import { ProblemType } from '@/enums/ProblemType';
import {
  selectDrawStatus,
  selectImagesInfo,
  selectSelImageIndexes,
  selectSelShapeIndex,
  selectShapes,
  setImageFiles,
  setSelDrawImageIndex,
  setSelImageIndexes,
  setXmlPreviewBoxStatus,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

type ImageItemProps = {
  index: number;
  name: string;
  type: ProblemType;
};

function ImageItem(props: ImageItemProps) {
  const { index: fileIndex, name, type } = props;
  const dispatch = useAppDispatch();
  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const selImageIndexes = useAppSelector(selectSelImageIndexes);
  const drawStatus = useAppSelector(selectDrawStatus);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);
  const labelClassify = imageFiles[fileIndex]?.label;

  const onCheckChange = (event: CheckboxChangeEvent) => {
    const set = new Set([...selImageIndexes]);
    if (event.target.checked) set.add(fileIndex);
    else set.delete(fileIndex);
    dispatch(setSelImageIndexes({ selImageIndexes: [...set] }));
  };

  const onItemClick = () => {
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
    URL.revokeObjectURL(imageFiles[fileIndex].obj_url);
    const newImageFiles = imageFiles.filter(
      (item, index) => index !== fileIndex
    );
    let newSelDrawImageIndex = selDrawImageIndex;
    if (newImageFiles.length === 0) {
      newSelDrawImageIndex = -1;
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
        selShapeIndex: fileIndex === selDrawImageIndex ? -1 : selShapeIndex,
      })
    );
  };

  return (
    <Row justify="space-between" style={{ padding: '8px 16px' }}>
      <Col xs={2}>
        <Checkbox
          checked={selImageIndexes.indexOf(fileIndex) !== -1}
          onChange={onCheckChange}
        />
      </Col>
      <Col xs={17}>
        <div className=" flex items-center gap-1">
          <div
            title={name}
            onClick={onItemClick}
            className="file-item-name"
            style={{
              color: fileIndex === selDrawImageIndex ? '#ff4d4f' : '#000000d9',
            }}
          >
            <span className="hover:text-blue-600 flex items-center gap-1">
              ({fileIndex + 1}) {name}
            </span>
          </div>
          {labelClassify ? (
            <CheckCircle className="text-green-500 w-4 h-4" />
          ) : null}
        </div>
      </Col>
      <Col xs={5} style={{ textAlign: 'end' }}>
        <Space>
          {type === ProblemType.DETECT ? (
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
          ) : null}
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
