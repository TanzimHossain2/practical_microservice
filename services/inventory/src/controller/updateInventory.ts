import prisma from '@/prisma';
import { InventoryUpdateDTOSchema } from '@/schemas';
import { NextFunction, Request, Response } from 'express';

export const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // check if the inventory exists
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      res.status(404).json({ message: 'Inventory not found' });
      return;
    }

    // update the inventory
    const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json(parsedBody.error.errors);
      return;
    }

    const { actionType, quantity } = parsedBody.data;

    // find the last history
    const lastHistory = await prisma.history.findFirst({
      where: { inventoryId: id },
      orderBy: { createdAt: 'desc' },
    });

    // calculate the new quantity
    let newQuantity = inventory.quantity;
    if (actionType === 'IN') {
      newQuantity += quantity;
    } else if (actionType === 'OUT') {
      newQuantity -= quantity;
    } else {
      res.status(400).json({ message: 'Invalid action type' });
      return;
    }

    // update the inventory
    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: newQuantity,
        histories: {
          create: {
            actionType,
            quantityChange: quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    res.status(200).json(updatedInventory);
  } catch (error) {
    next(error);
  }
};

