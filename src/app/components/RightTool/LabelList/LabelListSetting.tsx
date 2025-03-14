import { useState } from 'react';
import { cloneDeep } from 'lodash';
import { Dropdown, Button, Modal } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {
  deleteAllShapes,
  selectSelDrawImageIndex,
  selectSelShapeIndex,
  selectShapes,
  setSelShapeIndex,
  setShapes,
  setTextCopyBoxVisible,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function LabelListSetting() {
  const dispatch = useAppDispatch();
  const selDrawImageIndex = useAppSelector(selectSelDrawImageIndex);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onTextPreviewClick = () => {
    if (selDrawImageIndex === -1) return;
    dispatch(setTextCopyBoxVisible({ textCopyBoxVisible: true }));
  };

  const onShowAllClick = (visible: boolean) => {
    if (shapes[selDrawImageIndex]?.length === 0) return;
    const shapesCopy = cloneDeep(shapes);
    shapesCopy[selDrawImageIndex] = shapesCopy[selDrawImageIndex]?.map(item => {
      if (item.visible === visible) return item;
      const itemCopy = cloneDeep(item);
      itemCopy.visible = visible;
      return itemCopy;
    });
    dispatch(setShapes({ shapes: shapesCopy }));
    if (selShapeIndex) {
      dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    }
  };

  const onClearAllClick = () => {
    if (!shapes[selDrawImageIndex] || shapes[selDrawImageIndex].length === 0)
      return;
    setIsModalOpen(true);
  };

  const handleConfirmClearAll = () => {
    dispatch(deleteAllShapes());
    setIsModalOpen(false);
  };

  const handleCancelClearAll = () => {
    setIsModalOpen(false);
  };

  const items = [
    {
      key: '1',
      label: (
        <Button type="text" size="small" onClick={onTextPreviewClick}>
          Text Preview
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <Button type="text" size="small" onClick={() => onShowAllClick(true)}>
          Show All
        </Button>
      ),
    },
    {
      key: '3',
      label: (
        <Button type="text" size="small" onClick={() => onShowAllClick(false)}>
          Hide All
        </Button>
      ),
    },
    {
      key: '4',
      label: (
        <Button type="text" size="small" onClick={onClearAllClick}>
          Clear All
        </Button>
      ),
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} placement="bottomRight" arrow>
        <SettingOutlined />
      </Dropdown>

      <Modal
        title="Clear All Shapes"
        open={isModalOpen}
        onOk={handleConfirmClearAll}
        onCancel={handleCancelClearAll}
        okText="Clear All"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to clear all shapes? This action cannot be
          undone.
        </p>
      </Modal>
    </>
  );
}

export default LabelListSetting;
