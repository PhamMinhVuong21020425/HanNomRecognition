import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import { Modal, Row, Col, Input, Card, Button, InputRef } from 'antd';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { getSVGPathD } from '@/utils/general';
import { LABEL_STATUS_TYPES } from '@/constants';
import { DeleteOutlined } from '@ant-design/icons';
import {
  setCurrentShape,
  setLabelBoxStatus,
  setLabelTypes,
  setSelShapeIndex,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function LabelBox() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);
  const {
    selDrawImageIndex,
    currentShape,
    shapes,
    selShapeIndex,
    selLabelType,
    labelBoxStatus,
    labelBoxVisible,
    labelTypes,
  } = state;
  const draggleRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<InputRef | null>(null);
  const [currentLabelType, setCurrentLabelType] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });

  useEffect(() => {
    if (labelBoxStatus === LABEL_STATUS_TYPES.UPDATE) {
      setCurrentLabelType(selLabelType);
    } else {
      setCurrentLabelType('');
    }
    setTimeout(() => {
      if (inputRef.current) {
        const input = inputRef.current.input;
        if (input) {
          input.focus();
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }
    }, 100);
  }, [labelBoxStatus]);

  const onOk = () => {
    setCurrentLabelType(currentLabelType.trim());
    if (!currentLabelType) return;
    const shapesCopy = cloneDeep(shapes);
    if (labelBoxStatus === LABEL_STATUS_TYPES.CREATE) {
      const currentShapeCopy = cloneDeep(currentShape);
      if (!currentShapeCopy) return;
      currentShapeCopy.paths.pop();
      currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, true);
      currentShapeCopy.label = currentLabelType;
      shapesCopy[selDrawImageIndex] = [
        ...shapesCopy[selDrawImageIndex],
        currentShapeCopy,
      ];
    } else if (labelBoxStatus === LABEL_STATUS_TYPES.UPDATE) {
      shapesCopy[selDrawImageIndex][selShapeIndex].label = currentLabelType;
    }
    dispatch(setShapes({ shapes: shapesCopy }));
    dispatch(
      setLabelBoxStatus({
        selLabelType: currentLabelType,
        labelBoxVisible: false,
        labelBoxStatus: LABEL_STATUS_TYPES.IDLE,
      })
    );
    dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    if (!new Set(labelTypes).has(currentLabelType)) {
      dispatch(
        setLabelTypes({ labelTypes: [currentLabelType, ...labelTypes] })
      );
    }
  };

  const onCancel = () => {
    dispatch(setCurrentShape({ currentShape: null }));
    dispatch(
      setLabelBoxStatus({
        selLabelType: currentLabelType,
        labelBoxVisible: false,
        labelBoxStatus: LABEL_STATUS_TYPES.IDLE,
      })
    );
    dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
  };

  const onMouseOver = () => {
    setDisabled(prev => !prev);
  };

  const onMouseOut = () => {
    setDisabled(true);
  };

  const onStart = (event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = draggleRef?.current?.getBoundingClientRect();
    if (!targetRect) return;
    setBounds({
      left: -targetRect?.left + uiData?.x,
      right: clientWidth - (targetRect?.right - uiData?.x),
      top: -targetRect?.top + uiData?.y,
      bottom: clientHeight - (targetRect?.bottom - uiData?.y),
    });
  };

  const onInputLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentLabelType(event.target.value);
  };

  const onDeleteLableClick = (value: string) => {
    dispatch(
      setLabelTypes({ labelTypes: labelTypes.filter(item => item !== value) })
    );
  };

  const onLableItemClick = (value: string) => {
    setCurrentLabelType(value);
  };

  return (
    <Modal
      width="300px"
      maskClosable={false}
      title={
        <div
          style={{ width: '100%', cursor: 'move' }}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          Label Box
        </div>
      }
      open={labelBoxVisible}
      onOk={onOk}
      onCancel={onCancel}
      modalRender={modal => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event, uiData) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
      okButtonProps={{
        disabled: !currentLabelType.trim(),
      }}
    >
      <Row justify="center" gutter={[8, 12]}>
        <Col xs={24}>
          <Input
            ref={inputRef}
            placeholder="Label"
            value={currentLabelType}
            onChange={onInputLabelChange}
            allowClear
          />
        </Col>
        <Col xs={24}>
          <Card size="small" style={{ maxHeight: '170px', overflow: 'auto' }}>
            <Row justify="center" gutter={[8, 8]}>
              {labelTypes.map(item => (
                <Col key={item} xs={24} className="label-item">
                  <Row justify="space-between" gutter={[8, 8]}>
                    <Col xs={20}>
                      <div
                        title={item}
                        onClick={() => onLableItemClick(item)}
                        className="label-item-name"
                        style={{ width: '100%' }}
                      >
                        {item}
                      </div>
                    </Col>
                    <Col xs={4}>
                      <Button
                        danger
                        type="primary"
                        size="small"
                        shape="circle"
                        title="Delete label"
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteLableClick(item)}
                      />
                    </Col>
                  </Row>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}

export default LabelBox;
