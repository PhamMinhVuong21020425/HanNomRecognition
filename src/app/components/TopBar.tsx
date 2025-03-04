import '../scss/TopBar.scss';
import JSZip from 'jszip';
import { ChangeEvent, useState } from 'react';
import { message, Dropdown, Button, Tooltip } from 'antd';
import {
  FileImageOutlined,
  FileTextOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  LeftOutlined,
  RightOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { IoMenuSharp } from 'react-icons/io5';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { BiInfoCircle, BiFullscreen, BiExitFullscreen } from 'react-icons/bi';

import { ANNOTATION_TYPES, IMAGE_TYPES, IMPORT_TYPES } from '@/constants';
import {
  getURLExtension,
  imageSizeFactory,
  generateCoco,
  exportZip,
  generateYolo,
  fetchFileFromObjectUrl,
  generatePascalVoc,
} from '@/utils/general';

import {
  useAppDispatch,
  useAppSelector,
  setImageFiles,
  setSelShapeIndex,
  setSelDrawImageIndex,
} from '@/lib/redux';
import { ImageType } from '@/types/ImageType';

function TopBar() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);
  const {
    imageFiles,
    selDrawImageIndex,
    imageSizes,
    drawStatus,
    shapes,
    selShapeIndex,
  } = state;

  const [isFullScreen, setIsFullScreen] = useState(false);

  const onFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map(
      file => new File([file], `${new Date().getTime()}$$${file.name}`)
    );

    const newImagesState: ImageType[] = [];

    const formData = new FormData();
    newFiles.forEach(image => {
      formData.append('files', image);
      newImagesState.push({
        obj_url: URL.createObjectURL(image),
        name: image.name,
      });
    });

    // const response = await axios.post(
    //   'http://localhost:5000/api/detect',
    //   formData,
    //   {
    //     headers: { 'Content-Type': 'multipart/form-data' },
    //   }
    // );

    const newImageFiles = [...imageFiles, ...newImagesState];
    const newImageSizes = newImageFiles.map((item, index) =>
      imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
    );
    const newShapes = newImageFiles.map((item, index) =>
      shapes[index] ? shapes[index] : []
    );
    dispatch(
      setImageFiles({
        imageFiles: newImageFiles,
        selDrawImageIndex: selDrawImageIndex > 0 ? selDrawImageIndex : 0,
        imageSizes: newImageSizes,
        drawStatus,
        shapes: newShapes,
        selShapeIndex,
      })
    );
    const msg =
      files.length > 1 ? `${files.length} images` : `${files.length} image`;
    message.success(`Success to load ${msg}.`);
  };

  const onFilesTxtChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = [...event.target.files].filter(
      file =>
        ANNOTATION_TYPES.indexOf(getURLExtension(file.name).toLowerCase()) !==
        -1
    );

    const msg =
      files.length > 1 ? `${files.length} txt` : `${files.length} txt`;
    message.success(`Success to load ${msg}.`);
  };

  const onFilesAnnotationChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;
    const filess = event.target.files[0];
    //const msg = files.length > 1 ? `${files.length} zip` : `${files.length} zip`;
    //message.success(`Success to load ${msg}.`);
    //read zip
    var jsZip = new JSZip();
    let files: ImageType[] = [];
    await jsZip.loadAsync(filess).then(async zip => {
      // Extract files from the ZIP file
      const promises = Object.keys(zip.files)
        .filter(
          filename =>
            !zip.files[filename].dir &&
            IMAGE_TYPES.includes(getURLExtension(filename).toLowerCase())
        )
        .map(async filename => {
          const blob = await zip.files[filename].async('blob');
          const obj_url = URL.createObjectURL(blob);
          return {
            obj_url,
            name: filename,
          } as ImageType;
        });
      files = await Promise.all(promises);
    });
    const newImageFiles = [...imageFiles, ...files];
    const newImageSizes = newImageFiles.map((item, index) =>
      imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
    );
    const newShapes = newImageFiles.map((item, index) =>
      shapes[index] ? shapes[index] : []
    );
    dispatch(
      setImageFiles({
        imageFiles: newImageFiles,
        selDrawImageIndex: imageFiles.length ? selDrawImageIndex : 0,
        imageSizes: newImageSizes,
        drawStatus,
        shapes: newShapes,
        selShapeIndex,
      })
    );
  };

  const onSaveClick = () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }
    // const xmls = imageFiles.map((file, index) => generateXML(file, imageSizes[index], shapes[index]));
    // exportZip(imageFiles, xmls);
  };

  const onNextImageClick = () => {
    if (!imageFiles.length || imageFiles.length < 2) return;
    let index = selDrawImageIndex + 1;
    if (index >= imageFiles.length) index = 0;
    dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: index }));
  };

  const onPrevImageClick = () => {
    if (!imageFiles.length || imageFiles.length < 2) return;
    let index = selDrawImageIndex - 1;
    if (index < 0) index = imageFiles.length - 1;
    dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: index }));
  };

  const onFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    message.info(isFullScreen ? 'Exited full screen' : 'Entered full screen');
  };

  const onDownload = async (type: string) => {
    if (imageFiles.length === 0) return;

    const files = [];
    for (const img of imageFiles) {
      const file = await fetchFileFromObjectUrl(img.obj_url, img.name);
      files.push(file);
    }

    let xmls: string[] = [];

    switch (type) {
      case 'COCO':
        xmls = files.map((file, index) =>
          generateCoco(file, imageSizes[index], shapes[index])
        );
        break;
      case 'YOLO':
        xmls = files.map((file, index) =>
          generateYolo(file, imageSizes[index], shapes[index])
        );
        break;
      case 'PASCAL_VOC':
        xmls = files.map((file, index) =>
          generatePascalVoc(file, imageSizes[index], shapes[index])
        );
        break;
      default:
        break;
    }

    exportZip(files, xmls, type);
  };

  const saveItems = [
    {
      key: '1',
      label: (
        <Button type="text" size="small" onClick={() => onDownload('COCO')}>
          COCO Format
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <Button type="text" size="small" onClick={() => onDownload('YOLO')}>
          YOLO Format
        </Button>
      ),
    },
    {
      key: '3',
      label: (
        <Button
          type="text"
          size="small"
          onClick={() => onDownload('PASCAL_VOC')}
        >
          Pascal VOC Format
        </Button>
      ),
    },
  ];

  return (
    <div className="top-bar-container">
      <div className="top-bar-content">
        <div className="content-left">
          <Tooltip title="Menu">
            <button type="button" className="menu-button">
              <span className="menu-icon">
                <IoMenuSharp />
              </span>
              <span>Menu</span>
            </button>
          </Tooltip>

          <Tooltip title="Open Image Files">
            <label className="import-button">
              <input
                type="file"
                accept={IMAGE_TYPES.map(type => `.${type}`).join(',')}
                multiple
                onChange={onFilesChange}
                style={{ display: 'none' }}
                value={''}
              />
              <span className="save-icon">
                <FileImageOutlined />
              </span>
              <span className="tag-name">Open</span>
            </label>
          </Tooltip>

          <Tooltip title="Import Annotations">
            <label className="import-button">
              <input
                type="file"
                accept={IMPORT_TYPES.map(type => `.${type}`).join(',')}
                multiple
                onChange={onFilesAnnotationChange}
                style={{ display: 'none' }}
              />
              <span className="save-icon">
                <FileTextOutlined />
              </span>
              <span className="tag-name">Annotation</span>
            </label>
          </Tooltip>

          <Tooltip title="Save Project">
            <button type="button" className="save-button" onClick={onSaveClick}>
              <span className="save-icon">
                <SaveOutlined />
              </span>
              <span className="tag-name">
                <Dropdown
                  menu={{ items: saveItems }}
                  placement="bottomRight"
                  arrow
                >
                  <div>Save</div>
                </Dropdown>
              </span>
            </button>
          </Tooltip>

          <Tooltip title="Undo">
            <button type="button" className="save-button">
              <span className="save-icon">
                <UndoOutlined />
              </span>
              <span className="tag-name">Undo</span>
            </button>
          </Tooltip>

          <Tooltip title="Redo">
            <button type="button" className="save-button">
              <span className="save-icon">
                <RedoOutlined />
              </span>
              <span className="tag-name">Redo</span>
            </button>
          </Tooltip>
        </div>

        <div className="content-center">
          <button
            type="button"
            className="center-button"
            onClick={onPrevImageClick}
          >
            <LeftOutlined />
            <span style={{ marginLeft: '4px' }}>Prev</span>
          </button>
          <button
            type="button"
            className="center-button"
            onClick={onNextImageClick}
          >
            <span style={{ marginRight: '4px' }}>Next</span>
            <RightOutlined />
          </button>
        </div>

        <div className="content-right">
          <Tooltip title="Toggle Full Screen" className="mr-2">
            <button
              type="button"
              className="right-button"
              onClick={onFullScreen}
            >
              <span className="react-icon">
                {isFullScreen ? <BiExitFullscreen /> : <BiFullscreen />}
              </span>
              <span className="tag-name">Full Screen</span>
            </button>
          </Tooltip>

          <Tooltip title="User Guide">
            <button type="button" className="right-button">
              <span className="react-icon">
                <FaRegQuestionCircle />
              </span>
              <span className="tag-name">Guide</span>
            </button>
          </Tooltip>

          <Tooltip title="Information">
            <button type="button" className="right-button">
              <span className="info-icon">
                <BiInfoCircle />
              </span>
              <span className="tag-name">Info</span>
            </button>
          </Tooltip>

          <Tooltip title="Apply Filters">
            <button type="button" className="right-button">
              <span className="icon">
                <FilterOutlined />
              </span>
              <span className="tag-name">Filters</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
