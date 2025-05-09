import '../scss/TopBar.scss';
import JSZip from 'jszip';
import { ChangeEvent, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { message, Dropdown, Button, Tooltip, Tag } from 'antd';
import {
  FileImageOutlined,
  FileTextOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  LeftOutlined,
  RightOutlined,
  UnlockOutlined,
  LockOutlined,
  ClockCircleOutlined,
  EditOutlined,
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
  selectSelDataset,
} from '@/lib/redux';
import type { ImageSize } from '@/lib/redux';
import type { ImageType } from '@/types/ImageType';
import type { AnnotationFile } from '@/types/AnnotationType';
import DatasetInfoModal from './DatasetInfoModal';
import Loading from './Loading';

function TopBar() {
  const dispatch = useAppDispatch();
  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const drawStatus = useAppSelector(selectDrawStatus);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);
  const selDataset = useAppSelector(selectSelDataset);

  const [isModalOpen, setIsModalOpen] = useState(false);
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
    let images: ImageType[] = [];
    let annotations: AnnotationFile[] = [];
    let success = true;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        message.error('File is too large');
        setIsLoading(false);
        return;
      }
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      switch (fileExtension) {
        case 'zip': {
          // Extract files from the ZIP file
          const zip = await jsZip.loadAsync(file);
          const pathFiles = Object.keys(zip.files);
          const imagePromises = pathFiles
            .filter(
              path =>
                !zip.files[path].dir &&
                IMAGE_TYPES.includes(getURLExtension(path)?.toLowerCase())
            )
            .map(async path => {
              const blob = await zip.files[path].async('blob');
              const obj_url = URL.createObjectURL(blob);
              return {
                obj_url,
                name: `${new Date().getTime()}$$${path.split('/').pop()}`,
              } as ImageType;
            });

          const annotationPromises = pathFiles
            .filter(
              path =>
                !zip.files[path].dir &&
                ANNOTATION_TYPES.includes(getURLExtension(path)?.toLowerCase())
            )
            .map(async path => {
              const blob = await zip.files[path].async('blob');
              const text = await new Response(blob).text();
              return {
                text,
                name: path.split('/').pop(),
              } as AnnotationFile;
            });
          const newImages = await Promise.all(imagePromises);
          images = [...images, ...newImages];
          const newAnnotations = await Promise.all(annotationPromises);
          annotations = [...annotations, ...newAnnotations];
          break;
        }
        case 'json':
        case 'xml':
        case 'txt': {
          annotations.push({
            text: await file.text(),
            name: file.name,
          });
          break;
        }
        default:
          message.error('File type not supported');
          success = false;
          break;
      }
    }

    const newImageFiles = [...imageFiles, ...images];
    if (newImageFiles.length === 0) {
      message.error('No image to annotate');
      setIsLoading(false);
      return;
    }

    const newImageSizes = newImageFiles.map((_, index) =>
      imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
    );

    const newShapes = newImageFiles.map((_, index) =>
      shapes[index] ? shapes[index] : []
    );

    for (let i = 0; i < annotations.length; i++) {
      const imgIndex = newImageFiles.findIndex(
        img =>
          img.name.split('$$').pop()?.split('.')[0] ===
          annotations[i].name.split('$$').pop()?.split('.')[0]
      );

      const image = imgIndex !== -1 ? newImageFiles[imgIndex] : undefined;

      if (!image) continue;

      const fileExtension = annotations[i].name.split('.').pop()?.toLowerCase();
      switch (fileExtension) {
        case 'txt': {
          const size = await getImageSizeFromUrl(image.obj_url);
          newShapes[imgIndex] = parseYolo(
            annotations[i].text,
            imageSizeFactory(size)
          );
          break;
        }
        case 'xml': {
          newShapes[imgIndex] = parsePascalVoc(annotations[i].text);
          break;
        }
        case 'json': {
          newShapes[imgIndex] = parseCoco(annotations[i].text);
          break;
        }
        default:
          break;
      }
    }

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

    if (success) message.success(`Success to load ${msg}.`);
    setIsLoading(false);
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

  const onDownload = async (type: 'COCO' | 'YOLO' | 'PASCAL_VOC') => {
    if (imageFiles.length === 0) return;

    const files = [];
    const newImageSizes: ImageSize[] = [];
    for (const img of imageFiles) {
      const size = await getImageSizeFromUrl(img.obj_url);
      newImageSizes.push(imageSizeFactory(size));

      const file = await fetchFileFromObjectUrl(img.obj_url, img.name);
      files.push(file);
    }

    let content: string[] = [];

    switch (type) {
      case 'COCO':
        content = files.map((file, index) =>
          generateCoco(file, newImageSizes[index], shapes[index])
        );
        break;
      case 'YOLO':
        content = files.map((file, index) =>
          generateYolo(file, newImageSizes[index], shapes[index])
        );
        break;
      case 'PASCAL_VOC':
        content = files.map((file, index) =>
          generatePascalVoc(file, newImageSizes[index], shapes[index])
        );
        break;
      default:
        break;
    }

    exportZip(files, content, type);
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

        {selDataset ? (
          <div className="content-right">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="dataset-icon flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors duration-200">
                {selDataset.is_public ? (
                  <UnlockOutlined className="text-lg" />
                ) : (
                  <LockOutlined className="text-lg" />
                )}
              </div>

              <div className="dataset-info flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-base text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                    {selDataset.name}
                  </span>
                  <Tag
                    color={selDataset.type === 'detect' ? 'purple' : 'orange'}
                    className="m-0"
                  >
                    {selDataset.type === 'detect'
                      ? 'Detection'
                      : 'Classification'}
                  </Tag>
                </div>

                <div className="flex items-center text-sm text-gray-500 gap-4">
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-green-500" />
                    <span>
                      {new Date(selDataset.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <EditOutlined className="text-blue-500" />
                    <span>
                      {new Date(selDataset.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DatasetInfoModal
              dataset={selDataset}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        ) : (
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
        )}
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );
}

export default TopBar;
