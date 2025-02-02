import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import chalk from 'chalk';
import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.PORT || 4002;
const servicename = process.env.SERVICENAME || 'inventory-service';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(chalk.green(`${servicename} is running on port ${port}`));
});

