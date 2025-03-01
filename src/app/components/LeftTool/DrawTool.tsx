import { cloneDeep } from 'lodash';
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
  RotateCcw,
  X,
  Trash2,
  Eraser,
  MoreHorizontal,
  Upload as UploadIcon,
  Wand2,
} from 'lucide-react';

import {
  deleteAllShapes,
  deleteSelShape,
  setDragImage,
  setDrawStatus,
  setNotDragImage,
  setSelShapeType,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';
import { DRAW_STATUS_TYPES } from '@/constants';

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
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const state = useAppSelector(state => state.annotation);

  const {
    selDrawImageIndex,
    selShapeType,
    selShapeIndex,
    drawStatus,
    currentShape,
    shapes,
  } = state;

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
    const shapesCopy = cloneDeep(shapes);
    shapesCopy[selDrawImageIndex] = shapesCopy[selDrawImageIndex]?.map(item => {
      if (!item.isSelect) return item;
      const itemCopy = cloneDeep(item);
      itemCopy.isSelect = false;
      return itemCopy;
    });
    dispatch(setShapes({ shapes: shapesCopy }));
    dispatch(setDrawStatus({ drawStatus: DRAW_STATUS_TYPES.IDLE }));
  };

  const onSelShapeTypeChange = (shapeType: string) => {
    if (shapeType === selShapeType) return;
    dispatch(setSelShapeType({ selShapeType: shapeType }));
    switch (shapeType) {
      case 'move':
        dispatch(setDragImage());
        break;
      case 'pointer':
      case 'rotate':
      case 'polygon':
      case 'rectangle':
      default:
        dispatch(setNotDragImage());
        onResetClick();
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

  const handleAutoAnnotation = () => {
    message.info('Starting auto annotation...');
    setMoreMenuVisible(false);
    // Implement auto annotation logic here
  };

  const handleUploadAnnotation = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('Upload annotation', event.target.files);
    setMoreMenuVisible(false);
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
              <RotateCcw
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
              <h3 className="text-lg font-semibold mb-2">Clear All Images</h3>
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
          <Tooltip title="More Options" placement="top">
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
          </Tooltip>

          {/* More Options Dropdown Menu */}
          {moreMenuVisible && (
            <div
              ref={moreButtonRef}
              style={{
                position: 'absolute',
                left: '60px',
                top: '0px',
                width: '220px',
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

                {/* Upload Annotations Option */}
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
                      document.getElementById('upload-annotations')?.click()
                    }
                  >
                    <input
                      id="upload-annotations"
                      type="file"
                      accept=".txt"
                      multiple
                      onChange={handleUploadAnnotation}
                      style={{ display: 'none' }}
                      value={''}
                    />
                    <UploadIcon size={18} color="#52c41a" />
                    <span style={{ color: '#333333', fontSize: '14px' }}>
                      Upload Annotations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default DrawTool;
