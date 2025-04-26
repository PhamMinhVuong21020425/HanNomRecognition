import axios from 'axios';
import JSZip from 'jszip';
import { cloneDeep } from 'lodash';
import { shallowEqual } from 'react-redux';
import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Row, Col, Tooltip, Divider, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDrawPolygon,
  faVectorSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  MousePointer,
  Move,
  RotateCw,
  X,
  Trash2,
  Eraser,
  MoreHorizontal,
  Upload as UploadIcon,
  Wand2,
  Crop,
} from 'lucide-react';

import {
  deleteAllShapes,
  deleteSelShape,
  setDragImage,
  setNotDragImage,
  setIsRotate,
  setSelShapeType,
  setShapes,
  useAppDispatch,
  useAppSelector,
  setDetections,
  setSelShapeIndex,
  selectImagesInfo,
  selectShapes,
  selectCurrentShape,
  selectSelShapeIndex,
  selectSelShapeType,
  selectDrawStatus,
  selectSelDetectModel,
  selectSelClassifyModel,
} from '@/lib/redux';
import { DRAW_STATUS_TYPES, SHAPE_TYPES, ANNOTATION_TYPES } from '@/constants';
import {
  fetchFileFromObjectUrl,
  calculateBoundingBox,
  parseCoco,
  parseYolo,
  parsePascalVoc,
} from '@/utils/general';
import Loading from '../Loading';
import type { ImageType } from '@/types/ImageType';
import type { Shape } from '@/lib/redux';

// Define active tool type
type ActiveToolType =
  | 'pointer'
  | 'move'
  | 'rotate'
  | 'polygon'
  | 'rectangle'
  | null;

function DrawTool() {
  const dispatch = useAppDispatch();
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const moreButtonRef = useRef<HTMLDivElement>(null);

  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const shapes = useAppSelector(selectShapes);
  const currentShape = useAppSelector(selectCurrentShape);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);
  const selShapeType = useAppSelector(selectSelShapeType);
  const drawStatus = useAppSelector(selectDrawStatus);

  const selDetectModel = useAppSelector(selectSelDetectModel);
  const selClassifyModel = useAppSelector(selectSelClassifyModel);

  // Track which tool is active
  const [activeTool, setActiveTool] = useState<ActiveToolType>(
    selShapeType as ActiveToolType
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && currentShape !== null) {
        onResetClick();
      }

      if (event.key === 'Delete' && selShapeIndex !== -1) {
        onClearSelShapeClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentShape, selShapeIndex]);

  useEffect(() => {
    // Handle clicks outside the more menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node) &&
        moreMenuVisible
      ) {
        setMoreMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreMenuVisible]);

  const handleToolClick = (tool?: ActiveToolType, callback?: () => void) => {
    if (tool) setActiveTool(tool);
    if (callback) callback();
  };

  const onResetClick = () => {
    dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
  };

  const onSelShapeTypeChange = (shapeType: string) => {
    if (shapeType === selShapeType && shapeType !== SHAPE_TYPES.ROTATE) return;
    dispatch(setSelShapeType({ selShapeType: shapeType }));
    switch (shapeType) {
      case 'move':
        dispatch(setDragImage());
        break;
      case 'rotate':
        dispatch(setIsRotate());
        break;
      case 'pointer':
        dispatch(setNotDragImage());
        break;
      case 'polygon':
      case 'rectangle':
        dispatch(setNotDragImage());
        onResetClick();
        break;
      default:
        break;
    }
  };

  const onClearSelShapeClick = () => {
    dispatch(deleteSelShape());
  };

  const onClearAllClick = () => {
    dispatch(deleteAllShapes());
    setShowClearAllDialog(false);
  };

  const handleAutoAnnotation = async () => {
    if (imageFiles.length === 0) {
      message.error('Please upload an image first');
      return;
    }

    if (shapes[selDrawImageIndex] && shapes[selDrawImageIndex].length > 0) {
      message.error(
        'Please clear all shapes before auto annotation for this image'
      );
      return;
    }

    message.info('Starting auto annotation...');
    setMoreMenuVisible(false);
    setLoading(true);

    try {
      const formData = new FormData();
      const image = await fetchFileFromObjectUrl(
        imageFiles[selDrawImageIndex].obj_url,
        imageFiles[selDrawImageIndex].name
      );
      formData.append('files', image);

      if (selDetectModel) {
        formData.append('modelDetectPath', selDetectModel.path);
      }

      if (selClassifyModel) {
        formData.append('modelClassifyPath', selClassifyModel.path);
        formData.append('num_classes', selClassifyModel.num_classes.toString());
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_FLASK_API}/api/detect`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      dispatch(setDetections(response.data));
      setLoading(false);
      message.success('Auto annotation completed');
    } catch (error) {
      setLoading(false);
      message.error('Auto annotation failed');
    }
  };

  const handleUploadAnnotation = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (imageFiles.length === 0) {
      message.error('Please upload an image first');
      return;
    }

    setMoreMenuVisible(false);
    setLoading(true);
    const file = event.target.files?.[0];
    if (!file) return;

    const fileContent = await file.text();

    let success = true;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    switch (fileExtension) {
      case 'json': {
        const cocoShapesCopy = cloneDeep(shapes);
        cocoShapesCopy[selDrawImageIndex] = parseCoco(fileContent);
        dispatch(setShapes({ shapes: cocoShapesCopy }));
        break;
      }
      case 'xml': {
        const xmlShapesCopy = cloneDeep(shapes);
        xmlShapesCopy[selDrawImageIndex] = parsePascalVoc(fileContent);
        dispatch(setShapes({ shapes: xmlShapesCopy }));
        break;
      }
      case 'txt': {
        const yoloShapesCopy = cloneDeep(shapes);
        yoloShapesCopy[selDrawImageIndex] = parseYolo(
          fileContent,
          imageSizes[selDrawImageIndex]
        );
        dispatch(setShapes({ shapes: yoloShapesCopy }));
        break;
      }
      default:
        message.error('Invalid annotation format. File type not supported.');
        success = false;
        break;
    }
    setLoading(false);
    if (success) message.success('Annotation uploaded successfully');
  };

  const cropImagesAndCreateDataset = async (
    imgFile: ImageType,
    shapesOfImg: Shape[]
  ): Promise<void> => {
    // Create dataset folder structure
    const zip = new JSZip();
    const folderName = `classify_${imgFile.name.split('.')[0].split('$$').pop()}`;
    const datasetFolder = zip.folder(folderName);
    if (!datasetFolder) {
      throw new Error('Failed to create dataset folder');
    }

    // Create a canvas to draw and crop the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Load the image into an HTML Image element
    const loadImagePromise = new Promise<HTMLImageElement>(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = imgFile.obj_url;
    });

    const imageElement = await loadImagePromise;

    // Keep track of unique labels
    const processedLabels = new Set<string>();

    // Process each shape and crop the image
    for (let i = 0; i < shapesOfImg.length; i++) {
      const shape = shapesOfImg[i];

      if (!shape.visible) continue;

      // Calculate bounding box of the shape
      const boundingBox = calculateBoundingBox(shape.paths);

      // Skip if bounding box has no area
      if (boundingBox.width === 0 || boundingBox.height === 0) continue;

      // Create directory for this class if it doesn't exist yet
      if (!processedLabels.has(shape.label)) {
        datasetFolder.folder(shape.label);
        processedLabels.add(shape.label);
      }

      const labelFolder = datasetFolder.folder(shape.label);
      if (!labelFolder) {
        throw new Error(`Failed to create folder for label: ${shape.label}`);
      }

      // Set canvas dimensions to bounding box size
      canvas.width = boundingBox.width;
      canvas.height = boundingBox.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the cropped portion of the image
      ctx.drawImage(
        imageElement,
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height,
        0,
        0,
        boundingBox.width,
        boundingBox.height
      );

      // Convert canvas to blob
      const blob = await new Promise<Blob>(resolve =>
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else throw new Error('Failed to create blob from canvas');
        }, 'image/png')
      );

      // Generate a unique filename
      const filename = `${shape.label}_${imgFile.name.split('.')[0].split('$$').pop()}_${i}.png`;

      // Add the cropped image to the zip in the appropriate class folder
      labelFolder.file(filename, blob);
    }

    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(content);
    downloadLink.download = `${folderName}.zip`;
    downloadLink.click();

    // Clean up the created object URL
    URL.revokeObjectURL(downloadLink.href);
  };

  const handleCropImage = async () => {
    if (imageFiles.length === 0) {
      message.error('Please upload an image first');
      return;
    }

    message.info('Cropping image for classification...');
    setMoreMenuVisible(false);
    setLoading(true);

    // Crop the images based on the shapes for classification
    try {
      const currentImage = imageFiles[selDrawImageIndex];
      const shapesOfImg = shapes[selDrawImageIndex];
      await cropImagesAndCreateDataset(currentImage, shapesOfImg);
      message.success('Image cropped successfully');
    } catch (error) {
      console.error(
        'Error cropping image:',
        error instanceof Error ? error.message : String(error)
      );
      message.error('Failed to crop image');
    } finally {
      setLoading(false);
    }
  };

  // Common styles for tool buttons
  const toolButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'white',
    border: '1px solid #e8e8e8',
  };

  return (
    <div
      className="draw-tool-container"
      style={{
        backgroundColor: '#ffffff',
        width: '70px',
        padding: '16px 0px',
        borderRadius: '6px',
      }}
    >
      <Row justify="center" gutter={[0, 12]}>
        {/* Navigation Tools */}
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Selection Tool" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                backgroundColor: activeTool === 'pointer' ? '#f0f9eb' : 'white',
                borderColor: activeTool === 'pointer' ? '#b7eb8f' : '#e8e8e8',
              }}
              onClick={() =>
                handleToolClick('pointer', () =>
                  onSelShapeTypeChange('pointer')
                )
              }
            >
              <MousePointer
                size={22}
                color={activeTool === 'pointer' ? '#52c41a' : '#222222'}
              />
            </div>
          </Tooltip>
        </Col>
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Move Tool" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                backgroundColor: activeTool === 'move' ? '#f0f9eb' : 'white',
                borderColor: activeTool === 'move' ? '#b7eb8f' : '#e8e8e8',
              }}
              onClick={() =>
                handleToolClick('move', () => onSelShapeTypeChange('move'))
              }
            >
              <Move
                size={22}
                color={activeTool === 'move' ? '#52c41a' : '#222222'}
              />
            </div>
          </Tooltip>
        </Col>
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Rotate" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                backgroundColor: activeTool === 'rotate' ? '#f0f9eb' : 'white',
                borderColor: activeTool === 'rotate' ? '#b7eb8f' : '#e8e8e8',
              }}
              onClick={() =>
                handleToolClick('rotate', () => onSelShapeTypeChange('rotate'))
              }
            >
              <RotateCw
                size={22}
                color={activeTool === 'rotate' ? '#52c41a' : '#222222'}
              />
            </div>
          </Tooltip>
        </Col>

        <Divider style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />

        {/* Drawing Tools */}
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Rectangle Tool" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                backgroundColor:
                  activeTool === 'rectangle' ? '#f0f9eb' : 'white',
                borderColor: activeTool === 'rectangle' ? '#b7eb8f' : '#e8e8e8',
              }}
              onClick={() =>
                handleToolClick('rectangle', () =>
                  onSelShapeTypeChange('rectangle')
                )
              }
            >
              <FontAwesomeIcon
                icon={faVectorSquare}
                color={activeTool === 'rectangle' ? '#52c41a' : '#222222'}
                style={{ fontSize: '22px' }}
              />
            </div>
          </Tooltip>
        </Col>
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Polygon Tool" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                backgroundColor: activeTool === 'polygon' ? '#f0f9eb' : 'white',
                borderColor: activeTool === 'polygon' ? '#b7eb8f' : '#e8e8e8',
              }}
              onClick={() =>
                handleToolClick('polygon', () =>
                  onSelShapeTypeChange('polygon')
                )
              }
            >
              <FontAwesomeIcon
                icon={faDrawPolygon}
                color={activeTool === 'polygon' ? '#52c41a' : '#222222'}
                style={{ fontSize: '22px' }}
              />
            </div>
          </Tooltip>
        </Col>

        <Divider style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />

        {/* Manipulation Tools */}
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Cancel Current Shape (ESC)" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                opacity: drawStatus === DRAW_STATUS_TYPES.DRAWING ? 1 : 0.5,
                cursor:
                  drawStatus === DRAW_STATUS_TYPES.DRAWING
                    ? 'pointer'
                    : 'not-allowed',
              }}
              onClick={() =>
                drawStatus === DRAW_STATUS_TYPES.DRAWING &&
                handleToolClick(null, onResetClick)
              }
            >
              <X
                size={22}
                color={
                  drawStatus !== DRAW_STATUS_TYPES.DRAWING
                    ? '#999999'
                    : '#222222'
                }
              />
            </div>
          </Tooltip>
        </Col>
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Delete Selected Shape (DELETE)" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                opacity: selShapeIndex === -1 ? 0.5 : 1,
                cursor: selShapeIndex === -1 ? 'not-allowed' : 'pointer',
              }}
              onClick={() =>
                selShapeIndex !== -1 &&
                handleToolClick(null, onClearSelShapeClick)
              }
            >
              <Trash2
                size={22}
                color={selShapeIndex === -1 ? '#999999' : '#222222'}
              />
            </div>
          </Tooltip>
        </Col>
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Clear All Shapes" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                opacity:
                  !shapes[selDrawImageIndex] ||
                  shapes[selDrawImageIndex].length === 0
                    ? 0.5
                    : 1,
                cursor:
                  !shapes[selDrawImageIndex] ||
                  shapes[selDrawImageIndex].length === 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
              onClick={() => {
                if (
                  shapes[selDrawImageIndex] &&
                  shapes[selDrawImageIndex].length > 0
                ) {
                  setShowClearAllDialog(true);
                }
              }}
            >
              <Eraser
                size={22}
                color={
                  !shapes[selDrawImageIndex] ||
                  shapes[selDrawImageIndex].length === 0
                    ? '#999999'
                    : '#222222'
                }
              />
            </div>
          </Tooltip>
        </Col>

        {/* Clear All Shapes Confirmation Modal */}
        {showClearAllDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Clear All Shapes</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete all shapes?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearAllDialog(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    shapes[selDrawImageIndex] &&
                    shapes[selDrawImageIndex].length > 0 &&
                    handleToolClick(null, onClearAllClick)
                  }
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* More Options Button with Dropdown */}
        <Col
          span={24}
          style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              ...toolButtonStyle,
              backgroundColor: moreMenuVisible ? '#f0f9eb' : 'white',
              borderColor: moreMenuVisible ? '#b7eb8f' : '#e8e8e8',
            }}
            onClick={() => {
              setMoreMenuVisible(true);
            }}
          >
            <MoreHorizontal
              size={22}
              color={moreMenuVisible ? '#52c41a' : '#222222'}
            />
          </div>

          {/* More Options Dropdown Menu */}
          {moreMenuVisible && (
            <div
              ref={moreButtonRef}
              style={{
                position: 'absolute',
                left: '70px',
                bottom: '-30px',
                width: '230px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {/* Auto Annotation Option */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    gap: '10px',
                  }}
                  className="hover:bg-gray-100"
                  onClick={handleAutoAnnotation}
                >
                  <Wand2 size={18} color="#52c41a" />
                  <span style={{ color: '#333333', fontSize: '14px' }}>
                    Auto Annotation
                  </span>
                </div>

                {/* Upload Annotation Option */}
                <div className="hover:bg-gray-100">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s',
                      gap: '10px',
                    }}
                    onClick={() =>
                      document.getElementById('upload-annotation')?.click()
                    }
                  >
                    <input
                      id="upload-annotation"
                      type="file"
                      accept={ANNOTATION_TYPES.map(ext => `.${ext}`).join(',')}
                      onChange={handleUploadAnnotation}
                      style={{ display: 'none' }}
                      value={''}
                    />
                    <UploadIcon size={18} color="#52c41a" />
                    <span style={{ color: '#333333', fontSize: '14px' }}>
                      Upload Annotation
                    </span>
                  </div>
                </div>

                {/* Crop Image */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    gap: '10px',
                  }}
                  className="hover:bg-gray-100"
                  onClick={handleCropImage}
                >
                  <Crop size={18} color="#52c41a" />
                  <span style={{ color: '#333333', fontSize: '14px' }}>
                    Crop Image Classification
                  </span>
                </div>
              </div>
            </div>
          )}
        </Col>
      </Row>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );
}

export default DrawTool;
