import fs from 'fs';
import amqp from 'amqplib';
import axios from './lib/axios';
import dotenv from 'dotenv';
dotenv.config();

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
        try {
          const task = JSON.parse(msg.content.toString());
          console.log(`[✔] Processing task: ${task.id}`);

          const formData = new FormData();
          Object.entries(task).forEach(([key, value]) =>
            formData.append(key, String(value))
          );

          const fileBuffer = fs.readFileSync(task.dataset);
          const blob = new Blob([fileBuffer]);
          const datasetName = task.modelName.split(' ').join('_').toLowerCase();
          formData.append('dataset', blob, `${datasetName}.zip`);

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
            result: response.data,
          });

          console.log(`[✔] Result sent for task ${task.id}`, result.data);

          channel.ack(msg);
        } catch (error) {
          console.error('[❌] Error processing task:', error);
          channel.reject(msg, false);
        }
      }
    },
    { noAck: false }
  );
}

export default startWorker;
