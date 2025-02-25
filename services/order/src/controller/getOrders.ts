import prisma from '@/prisma';
import { NextFunction, Request, Response } from 'express';

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({});
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

