import axios from 'axios';
import { shallowEqual } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { FaRegNoteSticky } from 'react-icons/fa6';
import { MdAutoAwesome } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa6';
import { MousePointer, Move, RotateCw, X, Check, Edit } from 'lucide-react';
import {
  Row,
  Col,
  Tooltip,
  Divider,
  message,
  Modal,
  Input,
  Button,
  Tag,
  Space,
  Select,
} from 'antd';

import {
  setDragImage,
  setNotDragImage,
  setIsRotate,
  setSelShapeType,
  useAppDispatch,
  useAppSelector,
  selectImagesInfo,
  selectSelShapeType,
  setLabelImageFile,
} from '@/lib/redux';
import { SHAPE_TYPES } from '@/constants';
import { fetchFileFromObjectUrl } from '@/utils/general';
import Loading from '../components/Loading';

// Define active tool type
type ActiveToolType = 'pointer' | 'move' | 'rotate' | 'label' | 'auto' | null;

// Define label type
interface Label {
  id: string;
  name: string;
  color: string;
}

const colorOptions = [
  { value: '#f5222d', label: 'Red' },
  { value: '#2db7f5', label: 'Blue' },
  { value: '#87d068', label: 'Green' },
  { value: '#722ed1', label: 'Purple' },
  { value: '#eb2f96', label: 'Pink' },
  { value: '#ff7b00', label: 'Orange' },
  { value: '#fadb14', label: 'Yellow' },
  { value: '#13c2c2', label: 'Cyan' },
  { value: '#108ee9', label: 'Sky' },
  { value: '#14b8a6', label: 'Teal' },
];

const LeftToolbarClassify = () => {
  const dispatch = useAppDispatch();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const moreButtonRef = useRef<HTMLDivElement>(null);

  // Label states
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#f5222d');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [currentlySelectedLabel, setCurrentlySelectedLabel] = useState<
    string | null
  >(null);

  const { imageFiles, selDrawImageIndex } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const selShapeType = useAppSelector(selectSelShapeType);

  // Track which tool is active
  const [activeTool, setActiveTool] = useState<ActiveToolType>(
    selShapeType as ActiveToolType
  );

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
      default:
        break;
    }
  };

  const handleAutoAnnotation = async () => {
    if (imageFiles.length === 0) {
      message.error('Please upload an image first');
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
      formData.append('img', image);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_FLASK_API}/api/classify`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      dispatch(
        setLabelImageFile({
          imageIndex: selDrawImageIndex,
          label: response.data.predicted_label,
        })
      );
      setLoading(false);
      message.success('Auto annotation completed');
    } catch (error) {
      setLoading(false);
      message.error('Auto annotation failed');
    }
  };

  // Label management functions
  const showLabelModal = () => {
    setIsLabelModalVisible(true);
  };

  const handleLabelModalCancel = () => {
    setIsLabelModalVisible(false);
    setNewLabelName('');
    setEditingLabelId(null);
  };

  const addLabel = () => {
    if (!newLabelName.trim()) {
      message.error('Label name cannot be empty');
      return;
    }

    if (
      labels.some(
        label => label.name.toLowerCase() === newLabelName.toLowerCase()
      ) &&
      !editingLabelId
    ) {
      message.error('Label with this name already exists');
      return;
    }

    if (editingLabelId) {
      // Edit existing label
      setLabels(prev =>
        prev.map(label =>
          label.id === editingLabelId
            ? { ...label, name: newLabelName, color: newLabelColor }
            : label
        )
      );
      setEditingLabelId(null);
    } else {
      // Add new label
      const newLabel: Label = {
        id: Math.random().toString(36).substring(2, 11),
        name: newLabelName,
        color: newLabelColor,
      };
      setLabels(prev => [...prev, newLabel]);
    }

    setNewLabelName('');
  };

  const startEditLabel = (label: Label) => {
    setNewLabelName(label.name);
    setNewLabelColor(label.color);
    setEditingLabelId(label.id);
  };

  const deleteLabel = (id: string) => {
    if (currentlySelectedLabel === id) {
      setCurrentlySelectedLabel(null);
    }
    if (editingLabelId === id) {
      setNewLabelName('');
      setEditingLabelId(null);
    }
    setLabels(prev => prev.filter(label => label.id !== id));
  };

  const selectLabel = (labelId: string) => {
    setCurrentlySelectedLabel(labelId);
  };

  const handleApplyLabel = () => {
    if (currentlySelectedLabel) {
      const selectedLabel = labels.find(
        label => label.id === currentlySelectedLabel
      );
      if (selectedLabel && selDrawImageIndex !== -1) {
        dispatch(
          setLabelImageFile({
            imageIndex: selDrawImageIndex,
            label: selectedLabel.name,
          })
        );
        message.success(`Label "${selectedLabel.name}" applied to this image`);
        setCurrentlySelectedLabel(null);
        handleLabelModalCancel();
      }
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
    <>
      <Divider style={{ margin: '0 0 16px 0' }} />

      <div
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
                  backgroundColor:
                    activeTool === 'pointer' ? '#f0f9eb' : 'white',
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
                  backgroundColor:
                    activeTool === 'rotate' ? '#f0f9eb' : 'white',
                  borderColor: activeTool === 'rotate' ? '#b7eb8f' : '#e8e8e8',
                }}
                onClick={() =>
                  handleToolClick('rotate', () =>
                    onSelShapeTypeChange('rotate')
                  )
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

          <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Labels" placement="right">
              <div
                style={{
                  ...toolButtonStyle,
                  backgroundColor: activeTool === 'label' ? '#f0f9eb' : 'white',
                  borderColor: activeTool === 'label' ? '#b7eb8f' : '#e8e8e8',
                }}
                onClick={() => {
                  handleToolClick('label');
                  showLabelModal();
                }}
              >
                <FaRegNoteSticky
                  size={20}
                  color={activeTool === 'label' ? '#52c41a' : '#222222'}
                />
              </div>
            </Tooltip>
          </Col>

          <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Auto Annotation" placement="right">
              <div
                style={{
                  ...toolButtonStyle,
                  backgroundColor: activeTool === 'auto' ? '#f0f9eb' : 'white',
                  borderColor: activeTool === 'auto' ? '#b7eb8f' : '#e8e8e8',
                }}
                onClick={() => handleToolClick('auto', handleAutoAnnotation)}
              >
                <MdAutoAwesome
                  size={20}
                  color={activeTool === 'auto' ? '#52c41a' : '#222222'}
                />
              </div>
            </Tooltip>
          </Col>
        </Row>
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Loading />
          </div>
        )}
      </div>

      {/* Label Management Modal */}
      <Modal
        title="Manage Labels"
        open={isLabelModalVisible}
        onCancel={handleLabelModalCancel}
        footer={null}
        width={500}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>
              {editingLabelId ? 'Edit Label' : 'Add New Label'}
            </h4>
            <div className="flex gap-2">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Enter label name"
                  value={newLabelName}
                  onChange={e => setNewLabelName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Select
                  value={newLabelColor}
                  onChange={value => setNewLabelColor(value)}
                  style={{ width: '120px' }}
                  options={colorOptions}
                />
              </Space.Compact>

              <Button
                type="primary"
                onClick={addLabel}
                icon={
                  editingLabelId ? <Edit size={14} /> : <FaPlus size={14} />
                }
              >
                {editingLabelId ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div>
            <h4 style={{ margin: '0 0 16px 0' }}>All Labels</h4>
            {labels.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#888',
                  padding: '20px 0',
                }}
              >
                No labels created yet. Add a label to start labeling your
                images.
              </div>
            ) : (
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {labels.map(label => (
                    <div
                      key={label.id}
                      className={`flex justify-between items-center px-3 py-2 rounded cursor-pointer transition-colors ${
                        label.id === currentlySelectedLabel
                          ? 'bg-green-100'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => selectLabel(label.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tag color={label.color} style={{ marginRight: 8 }}>
                          {label.name}
                        </Tag>
                      </div>
                      <Space>
                        <Button
                          type="text"
                          icon={<Edit size={14} />}
                          onClick={e => {
                            e.stopPropagation();
                            startEditLabel(label);
                          }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<X size={16} />}
                          onClick={e => {
                            e.stopPropagation();
                            deleteLabel(label.id);
                          }}
                        />
                      </Space>
                    </div>
                  ))}
                </Space>
              </div>
            )}
          </div>

          {selDrawImageIndex !== -1 && (
            <div style={{ marginTop: '16px' }}>
              <Divider style={{ margin: '16px 0' }} />
              <div className="flex justify-end gap-3">
                <Button
                  type="default"
                  icon={<X size={16} />}
                  onClick={handleLabelModalCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<Check size={16} />}
                  disabled={!currentlySelectedLabel}
                  onClick={handleApplyLabel}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default LeftToolbarClassify;
