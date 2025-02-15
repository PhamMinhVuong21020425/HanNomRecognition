import { Dropdown, Button, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { generateXML, exportZip } from '@/utils/general';
import { DRAW_STATUS_TYPES } from '@/constants';
import {
  setImageFiles,
  setSelImageIndexes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function ImageListSetting() {
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
          selImageIndexes.indexOf(selDrawImageIndex) === -1 ? selShapeIndex : 0,
      })
    );
  };

  const onClearAllClick = () => {
    if (imageFiles.length === 0) return;
    dispatch(
      setImageFiles({
        imageFiles: [],
        selDrawImageIndex: 0,
        imageSizes: [],
        drawStatus: DRAW_STATUS_TYPES.IDLE,
        shapes: [],
        selShapeIndex: 0,
      })
    );
  };

  const onSaveSelectClick = () => {
    if (selImageIndexes.length === 0) {
      message.info('No images are selected.');
      return;
    }
    const files: any = [];
    const xmls: any = [];
    imageFiles.forEach((file, index) => {
      if (selImageIndexes.indexOf(index) === -1) return;
      files.push(file);
      const xml = generateXML(file, imageSizes[index], shapes[index]);
      xmls.push(xml);
    });
    exportZip(files, xmls);
  };

  const onSaveAllClick = () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }
    const xmls = imageFiles.map((file, index) =>
      generateXML(file, imageSizes[index], shapes[index])
    );
    exportZip(imageFiles, xmls);
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
        <Button type="text" size="small" onClick={onClearSelectClick}>
          Clear Select
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
    {
      key: '5',
      label: (
        <Button type="text" size="small" onClick={onSaveSelectClick}>
          Save Select
        </Button>
      ),
    },
    {
      key: '6',
      label: (
        <Button type="text" size="small" onClick={onSaveAllClick}>
          Save All
        </Button>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <SettingOutlined />
    </Dropdown>
  );
}

export default ImageListSetting;
