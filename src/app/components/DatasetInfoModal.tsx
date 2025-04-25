'use client';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import React, { useState, useEffect } from 'react';
import {
  Tooltip,
  Modal,
  Card,
  Tag,
  Divider,
  Form,
  Input,
  Switch,
  Button,
} from 'antd';
import {
  DatabaseOutlined,
  LockOutlined,
  UnlockOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined as FileDescriptionOutlined,
  CloseOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
} from '@ant-design/icons';

import { updateDatasetAsync, useAppDispatch } from '@/lib/redux';
import { Dataset } from '@/entities/dataset.entity';

type DatasetInfoModalProps = {
  dataset: Dataset;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

const DatasetInfoModal = (props: DatasetInfoModalProps) => {
  const { dataset, isModalOpen, setIsModalOpen } = props;
  const [timeAgo, setTimeAgo] = useState({
    created: '',
    updated: '',
  });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [form] = Form.useForm();
  const [isPublic, setIsPublic] = useState(dataset.is_public);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Format the dates as time ago
    const updateTimeAgo = () => {
      const now = new Date();
      const createdDate = new Date(dataset.created_at);
      const updatedDate = new Date(dataset.updated_at);

      setTimeAgo({
        created: formatDistance(createdDate, now, { addSuffix: true }),
        updated: formatDistance(updatedDate, now, { addSuffix: true }),
      });
    };

    updateTimeAgo();
    const timer = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Reset form and mode when dataset changes or modal opens
    if (isModalOpen) {
      form.setFieldsValue({
        name: dataset.name,
        description: dataset.description,
        is_public: dataset.is_public,
      });
      setIsEditing(false);
      setIsDeleting(false);
      setDeleteConfirmText('');
    }
  }, [dataset, isModalOpen, form]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setIsDeleting(false);
  };

  const handleEditMode = () => {
    setIsEditing(true);
    setIsDeleting(false);
  };

  const handleDeleteMode = () => {
    setIsDeleting(true);
    setIsEditing(false);
    setDeleteConfirmText('');
  };

  const handleCancelEdit = () => {
    form.setFieldsValue({
      name: dataset.name,
      description: dataset.description,
      is_public: dataset.is_public,
    });
    setIsEditing(false);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmText('');
  };

  const handleSaveChanges = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      dispatch(
        updateDatasetAsync({
          id: dataset.id,
          name: values.name,
          description: values.description,
          is_public: isPublic,
        })
      );
      setIsSubmitting(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteDataset = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/be/datasets/delete', {
        id: dataset.id,
      });
      if (response.data.success) {
        setIsSubmitting(false);
        setIsModalOpen(false);
        router.push('/import');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setIsSubmitting(false);
    }
  };

  const renderViewMode = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 m-0">
          {dataset.name}
        </h2>
        <div className="flex space-x-2">
          {dataset.is_public ? (
            <Tag color="green" className="flex items-center px-3 py-1">
              <UnlockOutlined className="mr-1" />
              Public
            </Tag>
          ) : (
            <Tag color="blue" className="flex items-center px-3 py-1">
              <LockOutlined className="mr-1" />
              Private
            </Tag>
          )}
          <Tag
            color={dataset.type === 'detect' ? 'purple' : 'orange'}
            className="px-3 py-1"
          >
            {dataset.type === 'detect' ? 'Detection' : 'Classification'}
          </Tag>
        </div>
      </div>

      <Divider className="my-4" />

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex items-start">
          <FileDescriptionOutlined className="text-gray-600 mt-1 mr-3" />
          <div>
            <h3 className="font-medium text-gray-800 m-0 mb-2">Description</h3>
            <p className="text-sm text-gray-900 m-0">
              {dataset.description || 'No description provided'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card size="small" className="bg-gray-50" variant={'borderless'}>
          <Tooltip title={new Date(dataset.created_at).toLocaleString()}>
            <div className="flex items-center">
              <ClockCircleOutlined className="text-green-500 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Created</div>
                <div className="text-sm font-medium">{timeAgo.created}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(dataset.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Tooltip>
        </Card>

        <Card size="small" className="bg-gray-50" variant={'borderless'}>
          <Tooltip title={new Date(dataset.updated_at).toLocaleString()}>
            <div className="flex items-center">
              <EditOutlined className="text-blue-500 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Last Updated</div>
                <div className="text-sm font-medium">{timeAgo.updated}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(dataset.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Tooltip>
        </Card>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDeleteMode}
          className="flex items-center text-sm font-medium px-3 py-4 min-w-[80px]"
        >
          Delete
        </Button>
        <Button
          icon={<EditOutlined />}
          onClick={handleEditMode}
          className="flex items-center text-sm font-medium px-3 py-4 border border-sky-600 bg-sky-100 text-sky-600 min-w-[80px]"
        >
          Edit
        </Button>
      </div>
    </>
  );

  const renderEditMode = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: dataset.name,
        description: dataset.description,
        is_public: dataset.is_public,
      }}
    >
      <Form.Item
        name="name"
        label={<span className="font-semibold">Dataset Name</span>}
        rules={[{ required: true, message: 'Please enter a dataset name' }]}
      >
        <Input placeholder="Enter dataset name" />
      </Form.Item>

      <Form.Item
        name="description"
        label={<span className="font-semibold">Description</span>}
      >
        <Input.TextArea
          placeholder="Enter description"
          rows={4}
          className="resize-none"
        />
      </Form.Item>

      <Form.Item
        name="is_public"
        label={<span className="font-semibold">Visibility</span>}
        valuePropName="checked"
      >
        <div className="flex items-center">
          <Switch
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
            checked={isPublic}
            onChange={checked => setIsPublic(checked)}
          />
          <span className="ml-2 text-sm text-gray-600">
            {isPublic
              ? 'Public - Anyone can view this dataset'
              : 'Private - Only you can access this dataset'}
          </span>
        </div>
      </Form.Item>

      <Form.Item
        label={<span className="font-semibold">Dataset Type</span>}
        className="mb-6"
      >
        <Tag
          color={dataset.type === 'detect' ? 'purple' : 'orange'}
          className="px-3 py-1"
        >
          {dataset.type === 'detect' ? 'Detection' : 'Classification'}
        </Tag>
        <span className="text-sm text-gray-500 ml-2">(Cannot be changed)</span>
      </Form.Item>

      <Divider className="my-6" />

      <div className="flex justify-end space-x-3">
        <Button onClick={handleCancelEdit}>Cancel</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveChanges}
          loading={isSubmitting}
          className="flex items-center bg-blue-500"
        >
          Save
        </Button>
      </div>
    </Form>
  );

  const renderDeleteMode = () => (
    <div className="delete-confirmation">
      <div className="bg-red-50 border border-red-100 rounded-lg p-6 mb-6">
        <div className="flex-col items-center justify-center">
          <div className="text-center mb-3">
            <WarningOutlined className="text-red-500 text-3xl" />
          </div>
          <div>
            <p className="text-red-600 mb-4">
              You are about to delete{' '}
              <span className="font-semibold">"{dataset.name}"</span>. This
              action cannot be undone.
            </p>
            <div className="bg-white border border-red-200 rounded p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                This will permanently delete:
              </h4>
              <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                <li>All images and annotations in this dataset</li>
                <li>All related settings and configurations</li>
              </ul>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To confirm, type{' '}
                <span className="font-semibold">"{dataset.name}"</span> in the
                box
              </label>
              <Input
                placeholder={`Type "${dataset.name}" to confirm`}
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                className="border-red-300 focus:border-red-500 focus:ring focus:ring-red-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancelDelete}
          className="flex items-center px-3 py-4 min-w-[80px]"
        >
          Back
        </Button>
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={handleDeleteDataset}
          disabled={deleteConfirmText !== dataset.name}
          loading={isSubmitting}
          className="flex items-center px-3 py-4 min-w-[80px]"
        >
          Delete Dataset
        </Button>
      </div>
    </div>
  );

  const getModalTitle = () => {
    if (isDeleting) {
      return (
        <div className="flex items-center text-red-500">
          <DeleteOutlined className="mr-2 text-xl" />
          <span className="text-xl">Delete Dataset</span>
        </div>
      );
    } else if (isEditing) {
      return (
        <div className="flex items-center">
          <EditOutlined className="mr-2 text-xl text-blue-500" />
          <span className="text-xl">Edit Dataset</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <DatabaseOutlined className="mr-2 text-xl text-blue-500" />
          <span className="text-xl">Dataset Details</span>
        </div>
      );
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      closeIcon={<CloseOutlined className="text-gray-500" />}
      styles={{ body: { padding: '16px 24px' } }}
    >
      <div className="dataset-details">
        {isDeleting
          ? renderDeleteMode()
          : isEditing
            ? renderEditMode()
            : renderViewMode()}
      </div>
    </Modal>
  );
};

export default DatasetInfoModal;
