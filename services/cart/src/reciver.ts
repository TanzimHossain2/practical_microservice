import amqp from 'amqplib';
import { QUEUE_URL } from './config';
import { redis } from './redis';

export const reviveFromQueue = async (
  queue: string,
  callback: (message: string) => void
) => {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    const exchange = 'order';

    await channel.assertExchange(exchange, 'direct', { durable: true });

    const q = await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(
      q.queue,
      (message) => {
        if (message) {
          callback(message.content.toString());
          channel.ack(message);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Failed to receive message from queue:', error);
  }
};

reviveFromQueue('clear-cart', async (message) => {
  console.log(`Received message: ${message}`);

  const parsedMessage = JSON.parse(message);

  const cartSessionId = (parsedMessage.cartSessionId as string).trim();

  const sessionDeletion = await redis.del(`session:${cartSessionId}`);
  const cartDeletion = await redis.del(`cart:${cartSessionId}`);

  if (sessionDeletion === 1 && cartDeletion === 1) {
    console.log('Cart cleared successfully');
  } else {
    console.log('Failed to clear cart or session');
  }
});

