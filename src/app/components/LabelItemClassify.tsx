import { useState } from 'react';
import {
  Row,
  Col,
  Space,
  Button,
  Input,
  Typography,
  Modal,
  notification,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  selectImageFiles,
  selectSelDrawImageIndex,
  useAppDispatch,
  useAppSelector,
  setLabelImageFile,
} from '@/lib/redux';

const { Text, Title } = Typography;
const { confirm } = Modal;

function LabelItemClassify() {
  const dispatch = useAppDispatch();
  const selDrawImageIndex = useAppSelector(selectSelDrawImageIndex);
  const imageFiles = useAppSelector(selectImageFiles);
  const label = imageFiles[selDrawImageIndex]?.label;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedLabel, setEditedLabel] = useState<string | undefined>();

  const handleEditClick = () => {
    if (label) {
      setEditedLabel(label);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (): void => {
    if (editedLabel) {
      dispatch(
        setLabelImageFile({
          imageIndex: selDrawImageIndex,
          label: editedLabel.trim(),
        })
      );

      notification.success({
        message: 'Label Updated',
        description: `Character label successfully updated to "${editedLabel.trim()}"`,
        placement: 'bottomRight',
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
  };

  const handleDeleteClick = (): void => {
    if (!label) return;

    confirm({
      title: 'Delete Character Label',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete the label "${label}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        dispatch(
          setLabelImageFile({
            imageIndex: selDrawImageIndex,
            label: undefined,
          })
        );

        notification.info({
          message: 'Label Deleted',
          description: 'Character label has been removed',
          placement: 'bottomRight',
        });
      },
    });
  };

  return label ? (
    <Row justify="space-between" align="middle" style={{ padding: '8px 16px' }}>
      <Col xs={16}>
        {isEditing ? (
          <Space>
            <Input
              value={editedLabel}
              onChange={e => setEditedLabel(e.target.value)}
              autoFocus
              placeholder="Enter Han Nom character label"
              style={{
                width: '100%',
                fontSize: '14px',
              }}
            />
          </Space>
        ) : (
          <div
            title={label}
            onClick={handleEditClick}
            className="label-item-name"
            style={{
              color: '#ff4d4f',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <div style={{ padding: '0 10px' }}> #1</div>
            {label}
          </div>
        )}
      </Col>
      <Col xs={8} style={{ textAlign: 'end' }}>
        <Space>
          {isEditing ? (
            <>
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={handleSaveEdit}
              />
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
              />
            </>
          ) : (
            <>
              <Button
                type="primary"
                size="small"
                shape="circle"
                title="Edit label"
                icon={<EditOutlined />}
                onClick={handleEditClick}
              />
              <Button
                type="primary"
                danger
                size="small"
                shape="circle"
                title="Delete label"
                icon={<DeleteOutlined />}
                onClick={handleDeleteClick}
              />
            </>
          )}
        </Space>
      </Col>
    </Row>
  ) : null;
}

export default LabelItemClassify;
