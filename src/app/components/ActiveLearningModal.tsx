import JSZip from 'jszip';
import axios from '@/lib/axios';
import { useState } from 'react';
import { Button, Modal, Form, Select, InputNumber, message } from 'antd';
import { Notification } from '@/entities/notification.entity';
import { NotificationStatus } from '@/enums/NotificationStatus';
import { selectImageFiles, selectUser, useAppSelector } from '@/lib/redux';
import { fetchFileFromObjectUrl, normalizeFileName } from '@/utils/general';

type ActiveLearningModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  openNotification: (notificationData: Partial<Notification>) => Promise<void>;
};

function ActiveLearningModal({
  visible,
  setVisible,
  openNotification,
}: ActiveLearningModalProps) {
  const [form] = Form.useForm();
  const [numberOfSamples, setNumberOfSamples] = useState<number>(0);
  const [modelInference, setModelInference] = useState('');
  const [strategy, setStrategy] = useState('');

  const userData = useAppSelector(selectUser);
  const imageFiles = useAppSelector(selectImageFiles);

  const handleActiveLearningSubmit = async () => {
    setVisible(false);
    form.resetFields();

    if (!userData) {
      message.error('Login to start active learning');
      return;
    }

    if (imageFiles.length === 0) {
      message.error('No images for active learning');
      return;
    }

    const filePromises = imageFiles.map(img =>
      fetchFileFromObjectUrl(img.obj_url, normalizeFileName(img.name))
    );

    const files = await Promise.all(filePromises);

    // Zip the content to send to the server
    const zip = new JSZip();
    const poolName =
      modelInference.split(' ').join('_').toLowerCase() + '_pool_data';
    const zipName = `${poolName}.zip`;
    const rootFolder = zip.folder(poolName);

    files.forEach((file: File) => {
      rootFolder?.file(file.name, file);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], zipName, { type: 'application/zip' });

    const formData = new FormData();
    formData.append('pool', zipFile);
    formData.append('poolName', poolName);
    formData.append('modelInference', modelInference);
    formData.append('n_samples', numberOfSamples.toString());
    formData.append('strategy', strategy);
    formData.append('userId', userData.id);

    const response = await axios.post('/be/train/active-learning', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    if (!data.success) {
      await openNotification({
        message: 'Active Learning Failed',
        description: 'Error while starting Active Learning',
        status: NotificationStatus.ERROR,
      });
      return;
    }

    await openNotification({
      message: 'Active Learning Started',
      description: `Active learning started with ${modelInference} model.`,
      status: NotificationStatus.INFO,
    });
  };

  return (
    <Modal
      title="Active Learning"
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
    >
      <Form form={form} onFinish={handleActiveLearningSubmit} layout="vertical">
        <Form.Item
          name="numberOfSamples"
          label="Number of Samples"
          rules={[
            {
              required: true,
              message: 'Please specify number of samples',
            },
          ]}
        >
          <InputNumber
            min={1}
            max={1000}
            placeholder="Enter number of samples"
            style={{ width: '100%' }}
            value={numberOfSamples}
            onChange={value => setNumberOfSamples(value!)}
          />
        </Form.Item>
        <Form.Item
          name="modelInference"
          label="Model Inference"
          rules={[{ required: true, message: 'Please select model inference' }]}
        >
          <Select
            placeholder="Select Model"
            value={modelInference}
            onChange={value => setModelInference(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="default">Default Model</Select.Option>
            <Select.Option value="custom1">Custom Model 1</Select.Option>
            <Select.Option value="custom2">Custom Model 2</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="activeLearningStatements"
          label="Active Learning Strategy"
          rules={[
            {
              required: true,
              message: 'Please select active learning strategy',
            },
          ]}
        >
          <Select
            placeholder="Select Statements"
            value={strategy}
            onChange={value => setStrategy(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="RandomSampling">
              Random Sampling
            </Select.Option>
            <Select.Option value="LeastConfidenceSampling">
              Least Confidence Sampling
            </Select.Option>
            <Select.Option value="MarginSampling">
              Margin Sampling
            </Select.Option>
            <Select.Option value="RatioSampling">Ratio Sampling</Select.Option>
            <Select.Option value="EntropySampling">
              Entropy-based Sampling
            </Select.Option>
            <Select.Option value="DropoutSampling">
              MC Dropout Sampling
            </Select.Option>
            <Select.Option value="BALDSampling">BALD Sampling</Select.Option>
            <Select.Option value="BatchBALDSampling">
              BatchBALD Sampling
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Start Active Learning
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ActiveLearningModal;
