import JSZip from 'jszip';
import axios from '@/lib/axios';
import { useEffect, useState } from 'react';
import { Button, Modal, Form, Select, InputNumber, message } from 'antd';
import { Notification } from '@/entities/notification.entity';
import { NotificationStatus } from '@/enums/NotificationStatus';
import {
  getModelsOfUserAsync,
  selectImageFiles,
  selectSelDataset,
  selectUser,
  selectUserModels,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';
import { fetchFileFromObjectUrl, normalizeFileName } from '@/utils/general';
import { Model } from '@/entities/model.entity';
import { ProblemType } from '@/enums/ProblemType';

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
  const [strategy, setStrategy] = useState('');

  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUser);
  const selDataset = useAppSelector(selectSelDataset);
  const imageFiles = useAppSelector(selectImageFiles);

  const userModels = useAppSelector(selectUserModels).filter(
    model => model.type === ProblemType.CLASSIFY
  );

  const defaultClsModel = {
    id: 'default',
    name: 'Classification Model',
    description: '',
    path: '',
  } as Model;

  const [modelInference, setModelInference] = useState<Model>(defaultClsModel);

  useEffect(() => {
    if (!userData) return;
    dispatch(getModelsOfUserAsync(userData.id));
  }, []);

  const handleSelectModel = (value: string) => {
    const selectedModel = userModels.find(model => model.id === value);
    if (selectedModel) {
      setModelInference(selectedModel);
    } else {
      setModelInference(defaultClsModel);
    }
  };

  const handleResetFields = () => {
    form.resetFields();
    setNumberOfSamples(0);
    setStrategy('');
    setModelInference(defaultClsModel);
  };

  const handleActiveLearningSubmit = async () => {
    setVisible(false);

    if (!userData) {
      message.error('Login to start active learning');
      return;
    }

    if (!selDataset) {
      message.error('No dataset selected');
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
      modelInference.name.split(' ').join('_').toLowerCase() + '_pool_data';
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
    formData.append('n_samples', numberOfSamples.toString());
    formData.append('strategy', strategy);
    formData.append('userId', userData.id);
    formData.append('datasetId', selDataset.id);

    if (modelInference.id !== 'default') {
      formData.append('modelId', modelInference.id);
      formData.append('modelPath', modelInference.path);
      formData.append('num_classes', modelInference.num_classes.toString());
    }

    handleResetFields();

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
      description: `Active learning started with ${modelInference.name} model.`,
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
            value={modelInference.id}
            onChange={value => handleSelectModel(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value={defaultClsModel.id}>
              {defaultClsModel.name}
              <span className="text-xs text-gray-500 ml-1">(default)</span>
            </Select.Option>
            {userModels.map(model => (
              <Select.Option key={model.id} value={model.id}>
                {model.name}
              </Select.Option>
            ))}
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
