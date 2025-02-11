import { createInventoryService } from '@/services/inventoryService';
import { NextFunction, Request, Response } from 'express';

export const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await createInventoryService(req.body);
    res.status(201).json(inventory);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid data')) {
      return res.status(400).json({ error: error.message });
    }

    if (error instanceof Error && error.message.startsWith('Conflict')) {
      return res
        .status(409)
        .json({ error: 'Conflict', message: error.message });
    }

    next(error);
  }
};
