import { useState } from 'react';
import { cloneDeep } from 'lodash';
import { Row, Col, Button, Radio, Space, RadioChangeEvent } from 'antd';
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons/faDrawPolygon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVectorSquare } from '@fortawesome/free-solid-svg-icons/faVectorSquare';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons/faDeleteLeft';
import { faEraser } from '@fortawesome/free-solid-svg-icons/faEraser';
import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons/faUpDownLeftRight';
import { faArrowPointer } from '@fortawesome/free-solid-svg-icons/faArrowPointer';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons/faEllipsis';

import { DRAW_STATUS_TYPES, SHAPE_TYPE_OPTIONS } from '@/constants';
import {
  deleteAllShapes,
  deleteSelShape,
  setDragImage,
  setDrawStatus,
  setNotDragImage,
  setSelShapeType,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function DrawTool() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);

  const {
    selDrawImageIndex,
    selShapeType,
    selShapeIndex,
    currentShape,
    shapes,
  } = state;
  const [isDrag, setIsDrag] = useState(false);

  const onResetClick = () => {
    const shapesCopy = cloneDeep(shapes);
    shapesCopy[selDrawImageIndex] = shapesCopy[selDrawImageIndex]?.map(item => {
      if (!item.isSelect) return item;
      const itemCopy = cloneDeep(item);
      itemCopy.isSelect = false;
      return itemCopy;
    });
    dispatch(setShapes({ shapes: shapesCopy }));
    dispatch(setDrawStatus({ drawStatus: DRAW_STATUS_TYPES.IDLE }));
  };

  const onSelShapeTypeChange = (event: RadioChangeEvent) => {
    dispatch(setNotDragImage());
    if (event.target.value === selShapeType) return;
    dispatch(setSelShapeType({ selShapeType: event.target.value }));
    onResetClick();
  };

  const onClearSelShapeClick = () => {
    dispatch(deleteSelShape());
  };

  const onClearAllClick = () => {
    dispatch(deleteAllShapes());
  };

  // normal mouse
  const onNormalMouse = () => {
    dispatch(setNotDragImage());
  };
  // drag button
  const onDragClick = () => {
    setIsDrag(!isDrag);

    if (!isDrag) {
      dispatch(setNotDragImage());
    } else {
      dispatch(setDragImage());
    }
  };
  return (
    <Row justify="center" gutter={[0, 12]}>
      <Col xs={24} style={{ textAlign: 'center' }}>
        <Button
          type="text"
          onClick={onNormalMouse}
          style={{ textAlign: 'center' }}
        >
          <span>
            <FontAwesomeIcon
              icon={faArrowPointer}
              style={{ paddingRight: '2px', fontSize: '20px' }}
            />
          </span>
        </Button>
      </Col>
      <Col xs={24} style={{ textAlign: 'center' }}>
        <Button
          type="text"
          onClick={onDragClick}
          style={{ textAlign: 'center' }}
        >
          {isDrag ? (
            <span>
              <FontAwesomeIcon
                icon={faUpDownLeftRight}
                style={{ paddingRight: '2px', fontSize: '20px' }}
              />
            </span>
          ) : (
            <span>
              <FontAwesomeIcon
                icon={faUpDownLeftRight}
                style={{
                  paddingRight: '2px',
                  fontSize: '20px',
                  color: '#1890ff',
                }}
              />
            </span>
          )}
        </Button>
      </Col>
      <Col xs={24} style={{ textAlign: 'center' }}>
        <Button type="text" style={{ textAlign: 'center' }}>
          <span>
            <FontAwesomeIcon
              icon={faRotateLeft}
              style={{ paddingRight: '2px', fontSize: '20px' }}
            />
          </span>
        </Button>
      </Col>
      <div
        style={{
          height: '1px',
          backgroundColor: 'black',
          width: '100%',
          zIndex: '100',
          margin: ' 10px 0px',
        }}
      ></div>
      <Col xs={24} style={{ textAlign: 'center' }}>
        <Radio.Group
          value={selShapeType}
          onChange={e => onSelShapeTypeChange(e)}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {SHAPE_TYPE_OPTIONS.map(item => (
              <Radio.Button
                key={item.value}
                value={item.value}
                style={{ border: ' none', fontSize: '20px', margin: '5px 0' }}
              >
                {item.label === 'Polygon' ? (
                  <span>
                    <FontAwesomeIcon
                      icon={faDrawPolygon}
                      style={{ paddingRight: '5px' }}
                    />
                  </span>
                ) : (
                  <span>
                    <FontAwesomeIcon
                      icon={faVectorSquare}
                      style={{ paddingRight: '5px' }}
                    />
                  </span>
                )}
              </Radio.Button>
            ))}
          </Space>
        </Radio.Group>
      </Col>
      <div
        style={{
          height: '1px',
          backgroundColor: 'black',
          width: '100%',
          zIndex: '100',
          margin: ' 10px 0px',
        }}
      ></div>
      <Col xs={24} style={{ textAlign: 'center', width: '100%' }}>
        <Button
          type="text"
          onClick={onResetClick}
          disabled={currentShape === null}
          style={{ textAlign: 'center' }}
        >
          <FontAwesomeIcon
            icon={faXmark}
            style={{ paddingRight: '2px', fontSize: '20px' }}
          />
        </Button>
      </Col>
      <Col xs={24} style={{ textAlign: 'center' }}>
        <Button
          type="text"
          onClick={onClearSelShapeClick}
          disabled={selShapeIndex === -1}
          style={{ textAlign: 'center' }}
        >
          <span>
            <FontAwesomeIcon
              icon={faDeleteLeft}
              style={{ paddingRight: '2px', fontSize: '20px' }}
            />
          </span>
        </Button>
      </Col>
      <Col xs={24} style={{ textAlign: 'center' }}>
        <Button
          type="text"
          onClick={onClearAllClick}
          disabled={
            !shapes[selDrawImageIndex] || shapes[selDrawImageIndex].length === 0
          }
          style={{ textAlign: 'center' }}
        >
          <span>
            <FontAwesomeIcon
              icon={faEraser}
              style={{ paddingRight: '2px', fontSize: '20px' }}
            />
          </span>
        </Button>
      </Col>
      <Col xs={24} style={{ textAlign: 'center' }}>
        <Button type="text" style={{ textAlign: 'center' }}>
          <span>
            <FontAwesomeIcon
              icon={faEllipsis}
              style={{ paddingRight: '2px', fontSize: '20px' }}
            />
          </span>
        </Button>
      </Col>
    </Row>
  );
}

export default DrawTool;
