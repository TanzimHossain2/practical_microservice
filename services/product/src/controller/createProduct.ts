import { createProductService } from '@/service';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(
      chalk.blue('💖 User Information'),
      req.headers['x-user-id'],
      req.headers['x-user-email']
    );

    if (!req.body.name || !req.body.price) {
      return res
        .status(400)
        .json({ error: 'Product name and price are required.' });
    }

    // Delegate business logic to the service
    const product = await createProductService(req.body);

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

