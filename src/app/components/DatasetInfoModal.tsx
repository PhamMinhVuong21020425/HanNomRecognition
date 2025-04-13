'use client';
import React, { useState, useEffect } from 'react';
import { Tooltip, Modal, Card, Tag, Divider } from 'antd';
import {
  DatabaseOutlined,
  LockOutlined,
  UnlockOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined as FileDescriptionOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { formatDistance } from 'date-fns';

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

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <DatabaseOutlined className="mr-2 text-xl text-blue-500" />
          <span className="text-xl">Dataset Details</span>
        </div>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      closeIcon={<CloseOutlined className="text-gray-500" />}
      styles={{ body: { padding: '16px 24px' } }}
    >
      <div className="dataset-details">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 m-0">
            {dataset.name}
          </h2>
          <div className="flex space-x-2">
            {dataset.is_public ? (
              <Tooltip title="Public Dataset">
                <Tag color="green" className="flex items-center px-3 py-1">
                  <UnlockOutlined className="mr-1" />
                  Public
                </Tag>
              </Tooltip>
            ) : (
              <Tooltip title="Private Dataset">
                <Tag color="blue" className="flex items-center px-3 py-1">
                  <LockOutlined className="mr-1" />
                  Private
                </Tag>
              </Tooltip>
            )}
            <Tooltip title="Dataset Type">
              <Tag
                color={dataset.type === 'detect' ? 'purple' : 'orange'}
                className="px-3 py-1"
              >
                {dataset.type === 'detect' ? 'Detection' : 'Classification'}
              </Tag>
            </Tooltip>
          </div>
        </div>

        <Divider className="my-4" />

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-start">
            <FileDescriptionOutlined className="text-gray-600 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-gray-800 m-0 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-900 m-0">{dataset.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
      </div>
    </Modal>
  );
};

export default DatasetInfoModal;
