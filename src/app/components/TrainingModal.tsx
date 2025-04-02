import JSZip from 'jszip';
import { useState } from 'react';
import {
  Button,
  Modal,
  Input,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  message,
} from 'antd';
import { Notification } from '@/entities/notification.entity';
import { NotificationStatus } from '@/enums/NotificationStatus';
import {
  selectImageFiles,
  selectShapes,
  selectUser,
  useAppSelector,
} from '@/lib/redux';
import {
  fetchFileFromObjectUrl,
  generateYoloTrain,
  getImageSizeFromUrl,
  normalizeFileName,
} from '@/utils/general';
import axios from '@/lib/axios';

type TrainingModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  openNotification: (notificationData: Partial<Notification>) => Promise<void>;
};

function TrainingModal({
  visible,
  setVisible,
  openNotification,
}: TrainingModalProps) {
  const [form] = Form.useForm();
  const [modelName, setModelName] = useState('');
  const [epochs, setEpochs] = useState(10);
  const [batchSize, setBatchSize] = useState(32);
  const [pretrainedModel, setPretrainedModel] = useState('default');
  const [description, setDescription] = useState('');

  const userData = useAppSelector(selectUser);
  const imageFiles = useAppSelector(selectImageFiles);
  const shapes = useAppSelector(selectShapes);

  const handleTrainSubmit = async () => {
    setVisible(false);
    form.resetFields();

    if (!userData) {
      message.error('Login to start training');
      return;
    }

    if (imageFiles.length === 0) {
      message.error('No images for training');
      return;
    }

    const filePromises = [];
    const sizePromises = [];
    for (const img of imageFiles) {
      const size = getImageSizeFromUrl(img.obj_url);
      sizePromises.push(size);

      const file = fetchFileFromObjectUrl(
        img.obj_url,
        normalizeFileName(img.name)
      );
      filePromises.push(file);
    }

    const files = await Promise.all(filePromises);
    const sizes = await Promise.all(sizePromises);

    const content: string[] = files.map((file, index) =>
      generateYoloTrain(file, sizes[index], shapes[index])
    );

    // Zip the content to send to the server
    const zip = new JSZip();
    const modelNameFormat = modelName.split(' ').join('_').toLowerCase();
    const zipName = `${modelNameFormat}.zip`;
    const rootFolder = zip.folder(modelNameFormat);
    if (!rootFolder) {
      message.error('Failed to create zip file');
      return;
    }
    const imagesFolder = rootFolder.folder('images');
    const labelsFolder = rootFolder.folder('labels');

    files.forEach((file: File, index: number) => {
      imagesFolder?.file(file.name, file);
      labelsFolder?.file(`${file.name.split('.')[0]}.txt`, content[index]);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], zipName, { type: 'application/zip' });

    const formData = new FormData();
    formData.append('dataset', zipFile);
    formData.append('modelName', modelName);
    formData.append('description', description);
    formData.append('pretrainedModel', pretrainedModel);
    formData.append('epochs', epochs.toString());
    formData.append('batchSize', batchSize.toString());
    formData.append('userId', userData.id);

    const response = await axios.post('/be/train/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    if (!data.success) {
      await openNotification({
        message: 'Training Failed',
        description: 'Error while starting training',
        status: NotificationStatus.ERROR,
      });
      return;
    }

    await openNotification({
      message: 'Training Started',
      description: `Model "${modelName}" is now training.`,
      status: NotificationStatus.INFO,
    });
  };

  return (
    <Modal
      title="Train New Model"
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleTrainSubmit}
        layout="vertical"
        initialValues={{
          epochs: 10,
          batchSize: 32,
          pretrainedModel: 'default',
        }}
      >
        <Form.Item
          name="modelName"
          label="Model Name"
          rules={[{ required: true, message: 'Please input model name' }]}
        >
          <Input
            placeholder="Enter model name"
            value={modelName}
            onChange={e => setModelName(e.target.value)}
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="epochs"
              label="Epochs"
              rules={[
                {
                  required: true,
                  message: 'Please specify number of epochs',
                },
              ]}
            >
              <InputNumber
                min={1}
                max={1000}
                placeholder="Enter number of epochs"
                style={{ width: '100%' }}
                value={epochs}
                onChange={value => setEpochs(value!)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="batchSize"
              label="Batch Size"
              rules={[{ required: true, message: 'Please specify batch size' }]}
            >
              <InputNumber
                min={1}
                max={1024}
                placeholder="Enter batch size"
                style={{ width: '100%' }}
                value={batchSize}
                onChange={value => setBatchSize(value!)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="pretrainedModel" label="Pre-trained Model">
          <Select
            value={pretrainedModel}
            onChange={value => setPretrainedModel(value)}
            placeholder="Select a pre-trained model"
            style={{ width: '100%' }}
          >
            <Select.Option value="default">Default Model</Select.Option>
            <Select.Option value="yolov5">YOLOv5</Select.Option>
            <Select.Option value="resnet50">ResNet-50</Select.Option>
            <Select.Option value="mobilenet">MobileNet</Select.Option>
            <Select.Option value="bert">BERT</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Enter model description (optional)"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Start Training
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default TrainingModal;
