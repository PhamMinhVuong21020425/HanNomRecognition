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
} from 'antd';
import { NotificationType } from '@/types/NotificationType';
import { useTrainingUpdates } from '../hooks/useSocket';

type TrainingModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  openNotification: (
    notificationData: Omit<NotificationType, 'key' | 'time'>
  ) => void;
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

  const [status, setStatus] = useState('Waiting...');
  const updates = useTrainingUpdates();

  const handleTrainSubmit = async (values: any) => {
    setStatus('Training started...');
    setVisible(false);
    openNotification({
      title: 'Training Started',
      description: `Model "${values.modelName}" is now training.`,
      status: 'info',
    });
    form.resetFields();

    const response = await fetch('http://localhost:8080/be/train/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'ResNet', parameters: { lr: 0.001 } }),
    });

    const data = await response.json();
    console.log('Response from Express:', data);
    setStatus(`Training started: ${data.message}`);
  };

  return (
    <div>
      <h1>AI Training</h1>
      <p>Status: {status}</p>

      <h2>Training Updates:</h2>
      <ul>
        {updates.map((update, index) => (
          <li key={index}>
            Task {update.taskId} - Accuracy: {update.result.accuracy}
          </li>
        ))}
      </ul>

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
                rules={[
                  { required: true, message: 'Please specify batch size' },
                ]}
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
    </div>
  );
}

export default TrainingModal;
