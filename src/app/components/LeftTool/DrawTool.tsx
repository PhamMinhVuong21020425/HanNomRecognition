import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { Row, Col, Tooltip, Divider } from 'antd';
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
  | 'more'
  | null;

function DrawTool() {
  const dispatch = useAppDispatch();
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const state = useAppSelector(state => state.annotation);

  const {
    selDrawImageIndex,
    selShapeType,
    selShapeIndex,
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
                opacity: currentShape === null ? 0.5 : 1,
                cursor: currentShape === null ? 'not-allowed' : 'pointer',
              }}
              onClick={() =>
                currentShape !== null && handleToolClick(null, onResetClick)
              }
            >
              <X
                size={22}
                color={currentShape === null ? '#999999' : '#222222'}
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

        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="More Options" placement="right">
            <div
              style={{
                ...toolButtonStyle,
                backgroundColor: activeTool === 'more' ? '#f0f9eb' : 'white',
                borderColor: activeTool === 'more' ? '#b7eb8f' : '#e8e8e8',
              }}
              onClick={() => handleToolClick('more')}
            >
              <MoreHorizontal
                size={22}
                color={activeTool === 'more' ? '#52c41a' : '#222222'}
              />
            </div>
          </Tooltip>
        </Col>
      </Row>
    </div>
  );
}

export default DrawTool;
