import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { configureRoutes } from './utils';

dotenv.config();

const app = express();

// security middleware
app.use(helmet());

// rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (_req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later.',
    });
  },
});

app.use('/api', limiter);

// logging middleware
app.use(morgan('dev'));
app.use(express.json());

// Todo Auth middleware

configureRoutes(app);

// health check endpoint
app.get('/health', (_req, res) => {
  res.json({ message: 'UP' });
});

// Not found middleware
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// error handler middleware
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(chalk.bgGreen.black(`Server running on port ${PORT}`));
});

