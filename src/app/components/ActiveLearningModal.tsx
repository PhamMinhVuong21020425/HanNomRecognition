import { useState } from 'react';
import { Button, Modal, Form, Select, InputNumber } from 'antd';
import { Notification } from '@/entities/notification.entity';
import { NotificationStatus } from '@/enums/NotificationStatus';

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
  const [numberOfSamples, setNumberOfSamples] = useState<number | null>(null);
  const [modelInference, setModelInference] = useState('');
  const [strategy, setStrategy] = useState('');

  const handleActiveLearningSubmit = async () => {
    setVisible(false);
    await openNotification({
      message: 'Active Learning',
      description: `Active learning started with ${modelInference} model.`,
      status: NotificationStatus.INFO,
    });
    form.resetFields();
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
            onChange={value => setNumberOfSamples(value)}
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
