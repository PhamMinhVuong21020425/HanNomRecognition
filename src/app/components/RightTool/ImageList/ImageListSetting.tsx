import { useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Dropdown, Button, message, Modal } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {
  generateXML,
  exportZip,
  fetchFileFromObjectUrl,
} from '@/utils/general';
import { DRAW_STATUS_TYPES } from '@/constants';
import {
  selectDrawStatus,
  selectImagesInfo,
  selectSelImageIndexes,
  selectSelShapeIndex,
  selectShapes,
  setImageFiles,
  setSelImageIndexes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function ImageListSetting() {
  const dispatch = useAppDispatch();
  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const selImageIndexes = useAppSelector(selectSelImageIndexes);
  const drawStatus = useAppSelector(selectDrawStatus);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSelectClick = (isAll: boolean) => {
    if (!isAll && selImageIndexes.length === 0) return;
    const indexes = isAll ? imageFiles.map((item, index) => index) : [];
    dispatch(setSelImageIndexes({ selImageIndexes: indexes }));
  };

  const onClearSelectClick = () => {
    if (selImageIndexes.length === 0) return;
    const newImageFiles = imageFiles.filter(
      (item, index) => selImageIndexes.indexOf(index) === -1
    );
    const newShapes = shapes.filter(
      (item, index) => selImageIndexes.indexOf(index) === -1
    );
    const newImageSizes = imageSizes.filter(
      (item, index) => selImageIndexes.indexOf(index) === -1
    );
    let newSelDrawImageIndex = selDrawImageIndex;
    if (newImageFiles.length === 0) {
      newSelDrawImageIndex = 0;
    } else if (selImageIndexes.indexOf(selDrawImageIndex) !== -1) {
      newSelDrawImageIndex = 0;
    } else {
      selImageIndexes.forEach(item => {
        if (item < selDrawImageIndex) newSelDrawImageIndex--;
      });
    }
    dispatch(
      setImageFiles({
        imageFiles: newImageFiles,
        selDrawImageIndex: newSelDrawImageIndex,
        imageSizes: newImageSizes,
        drawStatus:
          selImageIndexes.indexOf(selDrawImageIndex) === -1
            ? drawStatus
            : DRAW_STATUS_TYPES.IDLE,
        shapes: newShapes,
        selShapeIndex:
          selImageIndexes.indexOf(selDrawImageIndex) === -1
            ? selShapeIndex
            : -1,
      })
    );
  };

  const onClearAllClick = () => {
    if (imageFiles.length === 0) return;
    setIsModalOpen(true);
  };

  const handleConfirmClearAll = () => {
    dispatch(
      setImageFiles({
        imageFiles: [],
        selDrawImageIndex: -1,
        imageSizes: [],
        drawStatus: DRAW_STATUS_TYPES.IDLE,
        shapes: [],
        selShapeIndex: -1,
      })
    );
    setIsModalOpen(false);
  };

  const handleCancelClearAll = () => {
    setIsModalOpen(false);
  };

  const onSaveSelectClick = async () => {
    if (selImageIndexes.length === 0) {
      message.info('No images are selected.');
      return;
    }
    const files: File[] = [];
    const xmls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      if (selImageIndexes.indexOf(i) === -1) continue;

      const file = await fetchFileFromObjectUrl(img.obj_url, img.name);
      files.push(file);
      const xml = generateXML(file, imageSizes[i], shapes[i]);
      xmls.push(xml);
    }
    exportZip(files, xmls, 'PASCAL_VOC');
  };

  const onSaveAllClick = async () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }
    const files = [];
    for (const img of imageFiles) {
      const file = await fetchFileFromObjectUrl(img.obj_url, img.name);
      files.push(file);
    }
    const xmls = files.map((file, index) =>
      generateXML(file, imageSizes[index], shapes[index])
    );
    exportZip(files, xmls, 'PASCAL_VOC');
  };

  const items = [
    {
      key: '1',
      label: (
        <Button type="text" size="small" onClick={() => onSelectClick(true)}>
          Select All
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <Button type="text" size="small" onClick={() => onSelectClick(false)}>
          Select None
        </Button>
      ),
    },
    {
      key: '3',
      label: (
        <Button type="text" size="small" onClick={onSaveSelectClick}>
          Save Select
        </Button>
      ),
    },
    {
      key: '4',
      label: (
        <Button type="text" size="small" onClick={onSaveAllClick}>
          Save All
        </Button>
      ),
    },
    {
      key: '5',
      label: (
        <Button type="text" size="small" onClick={onClearSelectClick}>
          Clear Select
        </Button>
      ),
    },
    {
      key: '6',
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
        title="Clear All Images"
        open={isModalOpen}
        onOk={handleConfirmClearAll}
        onCancel={handleCancelClearAll}
        okText="Clear All"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to clear all images? This action cannot be
          undone.
        </p>
      </Modal>
    </>
  );
}

export default ImageListSetting;
