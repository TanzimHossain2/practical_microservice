import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'host.docker.internal',
  port: parseInt(process.env.SMTP_PORT || '1025'),
});

export const DEFAULT_SENDER =
  process.env.DEFAULT_SENDER_EMAIL || 'admin@example.com';

export const QUEUE_URL = process.env.QUEUE_URL || 'amqp://localhost';

