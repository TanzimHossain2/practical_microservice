import amqp from 'amqplib';
import { QUEUE_URL } from './config';

// Improved sendToQueue function
export const sendToQueue = async (queue: string, message: string) => {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    const exchange = 'order';

    // Assert exchange with proper type
    await channel.assertExchange(exchange, 'direct', { durable: true });

    // Assert queue for the specific service
    await channel.assertQueue(queue, { durable: true });

    // Publish the message to the correct exchange and queue
    await channel.publish(exchange, queue, Buffer.from(message));

    console.log(`Sent to exchange "${exchange}", queue "${queue}": ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Failed to send message to queue:', error);
  }
};

