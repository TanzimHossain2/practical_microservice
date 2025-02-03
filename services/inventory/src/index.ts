import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import chalk from 'chalk';
import morgan from 'morgan';
import router from './routes/route';

dotenv.config();

const app = express();
const port = process.env.PORT || 4002;
const servicename = process.env.SERVICENAME || 'inventory-service';

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

// CORS middleware
// app.use((req, res, next) => {
//   const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
//   const origin = req.headers.origin ?? '';

//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     next();
//   } else {
//     res.status(403).json({ error: 'Forbidden' });
//   }
// });

app.use(router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(chalk.red(err.stack));
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(chalk.green(`${servicename} is running on port ${port}`));
});
