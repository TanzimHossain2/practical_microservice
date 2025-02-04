import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import chalk from 'chalk';
import morgan from 'morgan';
import ProductRouter from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 4007;
const servicename = process.env.SERVICENAME || 'Order-Service';

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.use(ProductRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found ' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.log(chalk.red(err.stack));
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(chalk.green(`${servicename} is running on port ${port}`));
});
