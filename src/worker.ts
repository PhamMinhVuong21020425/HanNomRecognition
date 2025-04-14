import fs from 'fs';
import amqp from 'amqplib';
import axios from './lib/axios';
import dotenv from 'dotenv';
dotenv.config();

import { ModelStatus } from './enums/ModelStatus';
import { updateModel } from './services/model.services';
import { updateJob } from './services/job.services';
import { TrainingJobStatus } from './enums/TrainingJobStatus';

async function startWorker() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();
  await channel.assertQueue(process.env.QUEUE_NAME!, { durable: true });
  await channel.prefetch(1);
  console.log('[*] Worker is waiting for tasks...');

  channel.consume(
    process.env.QUEUE_NAME!,
    async msg => {
      if (msg !== null) {
        const task = JSON.parse(msg.content.toString());
        console.log(`[✔] Processing task: ${task.id}`);
        try {
          switch (task.type) {
            case 'detect':
              const formData = new FormData();
              Object.entries(task).forEach(([key, value]) =>
                formData.append(key, String(value))
              );

              const fileBuffer = fs.readFileSync(task.dataset);
              const blob = new Blob([fileBuffer]);
              formData.append('dataset', blob, `${task.datasetName}.zip`);

              await updateModel(task.modelId, {
                status: ModelStatus.TRAINING,
              });

              await updateJob(task.jobId, {
                status: TrainingJobStatus.INPROGRESS,
                started_at: new Date(),
              });

              // Call API Flask to train model
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_FLASK_API!}/api/train/detection`,
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }
              );
              console.log(
                `[✔] Training completed for ${task.id}: `,
                response.data
              );

              // Send result to Express server
              const result = await axios.post('/be/train/detect/result', {
                taskId: task.id,
                userId: task.userId,
                modelId: task.modelId,
                jobId: task.jobId,
                result: response.data,
              });

              console.log(`[✔] Result sent for task ${task.id}`, result.data);
              break;

            case 'classify':
              const clsFormData = new FormData();
              Object.entries(task).forEach(([key, value]) =>
                clsFormData.append(key, String(value))
              );

              const clsFileBuffer = fs.readFileSync(task.dataset);
              const clsBlob = new Blob([clsFileBuffer]);
              clsFormData.append('dataset', clsBlob, `${task.datasetName}.zip`);

              await updateModel(task.modelId, {
                status: ModelStatus.TRAINING,
              });

              await updateJob(task.jobId, {
                status: TrainingJobStatus.INPROGRESS,
                started_at: new Date(),
              });

              // Call API Flask to train model
              const clsResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_FLASK_API!}/api/train/classification`,
                clsFormData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }
              );

              console.log(
                `[✔] Training completed for ${task.id}: `,
                clsResponse.data
              );

              // Send result to Express server
              const classifyResult = await axios.post(
                '/be/train/classify/result',
                {
                  taskId: task.id,
                  userId: task.userId,
                  modelId: task.modelId,
                  jobId: task.jobId,
                  result: clsResponse.data,
                }
              );
              console.log(
                `[✔] Result sent for task ${task.id}`,
                classifyResult.data
              );
              break;

            case 'active_learning':
              const alFormData = new FormData();
              Object.entries(task).forEach(([key, value]) =>
                alFormData.append(key, String(value))
              );

              const alFileBuffer = fs.readFileSync(task.pool);
              const alBlob = new Blob([alFileBuffer]);
              alFormData.append('pool', alBlob, `${task.poolName}.zip`);

              await updateJob(task.jobId, {
                status: TrainingJobStatus.INPROGRESS,
                started_at: new Date(),
              });

              // Call API Flask to active learning images
              const alResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_FLASK_API!}/api/active-learning`,
                alFormData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }
              );
              console.log(
                `[✔] Training completed for ${task.id}: `,
                alResponse.data
              );

              // Send result to Express server
              const alResult = await axios.post(
                '/be/train/active-learning/result',
                {
                  taskId: task.id,
                  userId: task.userId,
                  jobId: task.jobId,
                  result: alResponse.data,
                }
              );
              console.log(
                `[✔] Result sent for task ${task.id}`,
                alResult.data
              );
              break;

            default:
              console.error(`[❌] Unknown task type: ${task.type}`);
              channel.reject(msg, false);
              return;
          }
          channel.ack(msg);
        } catch (error) {
          console.error('[❌] Error processing task:', error);

          if (task.modelId) {
            await updateModel(task.modelId, {
              status: ModelStatus.FAILED,
            });
          }

          await updateJob(task.jobId, {
            status: TrainingJobStatus.FAILED,
            completed_at: new Date(),
          });

          channel.reject(msg, false);
        }
      }
    },
    { noAck: false }
  );
}

export default startWorker;
