import prisma from '@/prisma';
import { NextFunction, Request, Response } from 'express';

export const getInventoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: {
        quantity: true,
      },
    });

    if (!inventory) {
      res.status(404).json({ message: 'Inventory not found' });
      return;
    }

    res.status(200).json(inventory);
  } catch (err) {
    next(err);
  }
};


