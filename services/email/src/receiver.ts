import amqp from 'amqplib';
import { z } from 'zod';
import { DEFAULT_SENDER, QUEUE_URL, transporter } from './config';
import prisma from './prisma';
import { EmailCreateSchema } from './schemas';

// A map of exchange names to queues for different services
const serviceQueueMap = {
  auth: 'auth-email-service',
  order: 'order-email-service',
  cart: 'cart-email-service',
  user: 'user-email-service',
  payment: 'payment-email-service',
};

export const reviveFromQueue = async () => {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    // Loop through each service's exchange and queue
    for (const [exchange, queue] of Object.entries(serviceQueueMap)) {
      // Assert the exchange and the queue for the specific service
      await channel.assertExchange(exchange, 'direct', { durable: true });
      await channel.assertQueue(queue, { durable: true });

      // Bind the queue to the exchange
      await channel.bindQueue(queue, exchange, queue);

      // Consume messages from this service's queue
      channel.consume(
        queue,
        async (message) => {
          if (message) {
            try {
              const parsedBody = JSON.parse(message.content.toString());
              console.log(`Received message from ${exchange} exchange, queue ${queue}:`, parsedBody);

              const { recipient, subject, body, source } =
                EmailCreateSchema.parse(parsedBody);
              const from = DEFAULT_SENDER;

              const emailOption = {
                from,
                to: recipient,
                subject,
                text: body,
              };

              // Send email
              const { rejected } = await transporter.sendMail(emailOption);
              if (rejected.length) {
                console.log(`Email rejected from ${source}: `, rejected);
                return;
              }

              // Save email record to the database
              await prisma.email.create({
                data: {
                  sender: from,
                  recipient,
                  subject,
                  body,
                  source,
                },
              });

              console.log(`Email sent successfully from ${source}`);
              channel.ack(message);
            } catch (error) {
              if (error instanceof z.ZodError) {
                console.error('Invalid email data:', error.errors);
              } else {
                console.error('Failed to send email:', error);
              }
              channel.nack(message, false, true); 
            }
          }
        },
        { noAck: false } 
      );
    }
  } catch (error) {
    console.error('Failed to receive message from queue:', error);
  }
};

reviveFromQueue();
