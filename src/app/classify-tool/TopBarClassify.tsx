import '../scss/TopBar.scss';
import JSZip from 'jszip';
import { ChangeEvent, useState } from 'react';
import { shallowEqual } from 'react-redux';
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

import {
  ANNOTATION_TYPES,
  IMAGE_TYPES,
  IMPORT_TYPES,
  MAX_FILE_SIZE,
} from '@/constants';

import {
  getURLExtension,
  imageSizeFactory,
  generateCoco,
  exportZip,
  generateYolo,
  fetchFileFromObjectUrl,
  generatePascalVoc,
  parseYolo,
  parsePascalVoc,
  parseCoco,
  getImageSizeFromUrl,
} from '@/utils/general';

import {
  useAppDispatch,
  useAppSelector,
  setImageFiles,
  setSelShapeIndex,
  setSelDrawImageIndex,
  selectImagesInfo,
  selectDrawStatus,
  selectShapes,
  selectSelShapeIndex,
} from '@/lib/redux';
import Loading from '../components/Loading';

function TopBarClassify() {
  const dispatch = useAppDispatch();
  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const drawStatus = useAppSelector(selectDrawStatus);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImagesState = Array.from(files).map(img => {
      return {
        obj_url: URL.createObjectURL(img),
        name: `${new Date().getTime()}$$${img.name}`,
      };
    });

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
        selDrawImageIndex: imageFiles.length > 0 ? imageFiles.length : 0,
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

  const onFilesAnnotationChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    setIsLoading(true);
    const files = Array.from(event.target.files);
    const msg =
      files.length > 1 ? `${files.length} files` : `${files.length} file`;

    const jsZip = new JSZip();
    let success = true;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        message.error('File is too large');
        setIsLoading(false);
        return;
      }
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
    }

    if (success) message.success(`Success to load ${msg}.`);
    setIsLoading(false);
  };

  const onSaveClick = () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }
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
                accept=".zip"
                onChange={onFilesAnnotationChange}
                style={{ display: 'none' }}
                value={''}
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
              <span className="tag-name">Save</span>
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
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );
}

export default TopBarClassify;
