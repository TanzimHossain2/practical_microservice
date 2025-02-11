import amqp from 'amqplib';
import { QUEUE_URL } from './config';
import { createUserService } from './service/userService';

export const reviveFromQueue = async (
  queue: string,
  callback: (message: string) => void
) => {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    const exchange = 'auth';

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

reviveFromQueue('user-profile-service', async (message) => {
  const parsedMessage = JSON.parse(message);

  const { userId, name, email } = parsedMessage;

  try {
    const user = await createUserService({ authUserId: userId, name, email });
    console.log(`User created successfully: ${JSON.stringify(user)}`);
  } catch (error) {
    console.error(
      `Error creating user: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }

  console.log(`Received user profile data: ${JSON.stringify(parsedMessage)}`);
});

