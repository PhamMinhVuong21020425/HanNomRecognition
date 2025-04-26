import '../scss/TopBar.scss';
import JSZip from 'jszip';
import { ChangeEvent, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { message, Tag, Tooltip } from 'antd';
import {
  FileImageOutlined,
  FileTextOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  ClockCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { IoMenuSharp } from 'react-icons/io5';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { BiInfoCircle, BiFullscreen, BiExitFullscreen } from 'react-icons/bi';

import { IMAGE_TYPES, MAX_FILE_SIZE } from '@/constants';

import { imageSizeFactory, fetchFileFromObjectUrl } from '@/utils/general';

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
import Loading from '../components/Loading';
import DatasetInfoModal from '../components/DatasetInfoModal';
import { ImageType } from '@/types/ImageType';

function TopBarClassify() {
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
    const jsZip = new JSZip();

    try {
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          message.error('File is too large');
          setIsLoading(false);
          return;
        }

        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        // Process zip files
        if (fileExtension === 'zip') {
          // Load the zip file
          const zipContent = await jsZip.loadAsync(file);
          const entries = Object.entries(zipContent.files);
          const totalEntries = entries.length;

          // Use batch processing to avoid memory issues
          const BATCH_SIZE = 100;
          let newImageFiles: ImageType[] = [...imageFiles];
          let processedCount = 0;
          let validImageCount = 0;

          // Process in batches
          for (let i = 0; i < entries.length; i += BATCH_SIZE) {
            const batch = entries.slice(i, i + BATCH_SIZE);
            const batchImages: ImageType[] = [];

            // Process each entry in the batch
            await Promise.all(
              batch.map(async ([path, zipEntry]) => {
                // Skip directories
                if (zipEntry.dir) return;

                // Extract the file path components
                const pathParts = path.split('/');

                // Get label from the parent directory name
                const parentDir = pathParts[pathParts.length - 2];
                const label = parentDir === 'unlabeled' ? undefined : parentDir;
                const fileName = pathParts[pathParts.length - 1];

                // Check if it's an image file
                const imgExtension = fileName.split('.').pop()?.toLowerCase();
                if (!IMAGE_TYPES.includes(imgExtension || '')) {
                  return;
                }

                try {
                  // Extract the file blob
                  const blob = await zipEntry.async('blob');
                  const objectUrl = URL.createObjectURL(blob);

                  batchImages.push({
                    obj_url: objectUrl,
                    name: fileName,
                    label,
                  });
                  validImageCount++;
                } catch (error) {
                  console.warn(`Failed to extract ${fileName}:`, error);
                }
              })
            );

            // Update state with this batch before processing the next
            if (batchImages.length > 0) {
              newImageFiles = [...newImageFiles, ...batchImages];
              const newImageSizes = newImageFiles.map((item, index) =>
                imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
              );
              const newShapes = newImageFiles.map((item, index) =>
                shapes[index] ? shapes[index] : []
              );

              // Dispatch the action to update the state
              dispatch(
                setImageFiles({
                  imageFiles: newImageFiles,
                  selDrawImageIndex:
                    imageFiles.length > 0 ? imageFiles.length : 0,
                  imageSizes: newImageSizes,
                  drawStatus,
                  shapes: newShapes,
                  selShapeIndex,
                })
              );
            }

            processedCount += batch.length;
            if (validImageCount > 500) {
              setIsLoading(false);
              message.success(
                `Completed processing. Added ${validImageCount} images.`
              );
              return;
            }
            message.info(
              `Processed ${processedCount} of ${totalEntries} entries (${validImageCount} valid images found)...`
            );
          }

          message.success(
            `Completed processing. Added ${validImageCount} images.`
          );
        } else if (IMAGE_TYPES.includes(fileExtension || '')) {
          // Process individual image files
          const objectUrl = URL.createObjectURL(file);
          const singleImage: ImageType = {
            obj_url: objectUrl,
            name: file.name,
          };

          const newImageFiles = [...imageFiles, singleImage];
          const newImageSizes = newImageFiles.map((item, index) =>
            imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
          );
          const newShapes = newImageFiles.map((item, index) =>
            shapes[index] ? shapes[index] : []
          );

          // Dispatch the action to update the state
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

          message.success('Successfully added 1 image.');
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      message.error('Failed to process the files');
    }

    setIsLoading(false);
  };

  const onSaveClick = async () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }

    // Create a new JSZip instance
    const zip = new JSZip();
    const mainFolder = zip.folder('classify_dataset');

    // Pre-fetch all files in parallel instead of sequentially
    const fetchPromises = imageFiles.map(img =>
      fetchFileFromObjectUrl(img.obj_url, img.name).then(file => ({
        file,
        label: img.label || 'unlabeled',
      }))
    );

    const fetchedFiles = await Promise.all(fetchPromises);

    // Group images by label more efficiently
    const imagesByLabel = fetchedFiles.reduce(
      (acc, { file, label }) => {
        if (!acc[label]) {
          acc[label] = [];
        }
        acc[label].push(file);
        return acc;
      },
      {} as Record<string, File[]>
    );

    // Create promises for all file reading operations
    const filePromises: Promise<void>[] = [];

    // Process each label group
    Object.entries(imagesByLabel).forEach(([label, files]) => {
      const labelFolder = mainFolder?.folder(label);

      // Add each file to its label folder
      files.forEach(file => {
        const filePromise = new Promise<void>(resolve => {
          const reader = new FileReader();
          reader.onload = e => {
            if (e.target?.result && labelFolder) {
              // Add file to the zip
              labelFolder.file(file.name, e.target.result as ArrayBuffer);
            }
            resolve();
          };
          reader.readAsArrayBuffer(file);
        });

        filePromises.push(filePromise);
      });
    });

    // When all files are processed, generate the zip
    Promise.all(filePromises)
      .then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
          // Create a download link
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = 'dataset.zip';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          message.success('Dataset exported successfully!');
        });
      })
      .catch(error => {
        console.error('Error creating zip file:', error);
        message.error('Failed to export dataset.');
      });
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

export default TopBarClassify;
