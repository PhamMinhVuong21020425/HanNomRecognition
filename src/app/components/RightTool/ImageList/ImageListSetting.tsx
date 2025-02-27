import { Dropdown, Button, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {
  generateXML,
  exportZip,
  fetchFileFromObjectUrl,
} from '@/utils/general';
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
          selImageIndexes.indexOf(selDrawImageIndex) === -1
            ? selShapeIndex
            : -1,
      })
    );
  };

  const onClearAllClick = () => {
    if (imageFiles.length === 0) return;
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
    exportZip(files, xmls);
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
    exportZip(files, xmls);
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
