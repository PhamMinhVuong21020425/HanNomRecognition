import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function startWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    const channel = await connection.createChannel();
    await channel.assertQueue(process.env.QUEUE_NAME!, { durable: true });
    await channel.prefetch(2);

    console.log('[*] Worker is waiting for tasks...');

    channel.consume(
      process.env.QUEUE_NAME!,
      async msg => {
        if (msg !== null) {
          const task = JSON.parse(msg.content.toString());
          console.log(`[✔] Processing task: ${task.id}`);

          // Call API Flask to train model
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_FLASK_API!}/train`,
            task
          );
          console.log(`[✔] Training completed for ${task.id}`);

          // Send result to Express server
          const result = await fetch(
            `${process.env.BACKEND_URL}/be/train/detect/result`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                taskId: task.id,
                result: response.data,
              }),
            }
          );

          const data = await result.json();
          console.log(`[✔] Result sent for task ${task.id}`, data);

          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('[❌] Error during consume task:', error);
    throw error;
  }
}

export default startWorker;
