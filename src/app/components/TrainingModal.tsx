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
  selectSelDataset,
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
import { ProblemType } from '@/enums/ProblemType';

type TrainingModalProps = {
  type: ProblemType;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  openNotification: (notificationData: Partial<Notification>) => Promise<void>;
};

function TrainingModal({
  type,
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
  const selDataset = useAppSelector(selectSelDataset);
  const imageFiles = useAppSelector(selectImageFiles);
  const shapes = useAppSelector(selectShapes);

  const handleTrainSubmit = async () => {
    setVisible(false);
    form.resetFields();

    if (!userData) {
      message.error('Login to start training');
      return;
    }

    if (!selDataset) {
      message.error('No dataset selected');
      return;
    }

    if (imageFiles.length === 0) {
      message.error('No images for training');
      return;
    }

    switch (type) {
      case ProblemType.DETECT:
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
        const datasetName = modelName.split(' ').join('_').toLowerCase();
        const zipName = `${datasetName}.zip`;
        const rootFolder = zip.folder(datasetName);
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
        const zipFile = new File([zipBlob], zipName, {
          type: 'application/zip',
        });

        const formData = new FormData();
        formData.append('dataset', zipFile);
        formData.append('datasetName', datasetName);
        formData.append('modelName', modelName);
        formData.append('description', description);
        formData.append('pretrainedModel', pretrainedModel);
        formData.append('epochs', epochs.toString());
        formData.append('batchSize', batchSize.toString());
        formData.append('userId', userData.id);
        formData.append('datasetId', selDataset.id);

        const response = await axios.post('/be/train/detect', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = response.data;
        if (!data.success) {
          await openNotification({
            message: 'Training Failed',
            description: 'Error while starting training detection model',
            status: NotificationStatus.ERROR,
          });
          return;
        }

        await openNotification({
          message: 'Training Started',
          description: `Model "${modelName}" is now training.`,
          status: NotificationStatus.INFO,
        });
        break;

      case ProblemType.CLASSIFY:
        const clsFilePromises = imageFiles.map(img =>
          fetchFileFromObjectUrl(img.obj_url, normalizeFileName(img.name))
        );
        const clsFiles = await Promise.all(clsFilePromises);

        // Zip the content to send to the server
        const clsZip = new JSZip();
        const clsDatasetName = modelName.split(' ').join('_').toLowerCase();
        const clsZipName = `${clsDatasetName}.zip`;
        const clsRootFolder = clsZip.folder(clsDatasetName);
        if (!clsRootFolder) {
          message.error('Failed to create zip file');
          return;
        }

        // Shuffle files to ensure random distribution
        const fileData = clsFiles.map((file, index) => ({
          file,
          label: imageFiles[index].label || 'unlabeled',
        }));

        const shuffledFiles = fileData.sort(() => Math.random() - 0.5);

        // Split into train and val sets
        const splitIndex = Math.floor(clsFiles.length * 0.8);
        const trainFiles = shuffledFiles.slice(0, splitIndex);
        const valFiles = shuffledFiles.slice(splitIndex);

        // Create train and val sets
        const addToZip = (files: typeof fileData, subset: 'train' | 'val') => {
          files.forEach(({ file, label }) => {
            const path = `${subset}/${label}/${file.name}`;
            clsRootFolder.file(path, file);
          });
        };

        addToZip(trainFiles, 'train');
        addToZip(valFiles, 'val');

        // Generate the zip file
        const clsZipBlob = await clsZip.generateAsync({ type: 'blob' });
        const clsZipFile = new File([clsZipBlob], clsZipName, {
          type: 'application/zip',
        });

        const clsFormData = new FormData();
        clsFormData.append('dataset', clsZipFile);
        clsFormData.append('datasetName', clsDatasetName);
        clsFormData.append('modelName', modelName);
        clsFormData.append('description', description);
        clsFormData.append('pretrainedModel', pretrainedModel);
        clsFormData.append('epochs', epochs.toString());
        clsFormData.append('batchSize', batchSize.toString());
        clsFormData.append('userId', userData.id);
        clsFormData.append('datasetId', selDataset.id);

        const clsResponse = await axios.post(
          '/be/train/classify',
          clsFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (!clsResponse.data.success) {
          await openNotification({
            message: 'Training Failed',
            description: 'Error while starting training classification model',
            status: NotificationStatus.ERROR,
          });
          return;
        }

        await openNotification({
          message: 'Training Started',
          description: `Model "${modelName}" is now training.`,
          status: NotificationStatus.INFO,
        });
        break;
    }
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
