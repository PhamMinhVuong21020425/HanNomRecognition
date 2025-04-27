import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

async function sendToQueue(task: any) {
  try {
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(process.env.QUEUE_NAME!, { durable: true });

    const message = Buffer.from(JSON.stringify(task));
    channel.sendToQueue(process.env.QUEUE_NAME!, message, {
      persistent: true,
    });

    console.log(`[✔] Task sent to queue: ${task.id}`);
    setTimeout(async () => {
      await channel.close();
      await connection.close();
      console.log(`[✔] Connection closed after sending task`);
    }, 500);
  } catch (error) {
    console.error(`[❌] Error sending task to queue:`, error);
    throw error;
  }
}

export default sendToQueue;
