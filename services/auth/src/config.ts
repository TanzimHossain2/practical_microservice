export const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:4004';

export const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const EMAIL_SERVICE = process.env.EMAIL_SERVICE_URL || 'http://localhost:4005';

export const EXPIRATION_TIME = process.env.EXPIRATION_TIME || '1h';

export const QUEUE_URL = process.env.QUEUE_URL || 'amqp://localhost';