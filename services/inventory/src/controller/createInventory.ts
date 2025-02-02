import prisma from '@/prisma';
import { InventoryCreateDTOSchema } from '@/schemas';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextFunction, Request, Response } from 'express';

export const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => { 
  try {
    // Validate the request body
    const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: parsedBody.error.errors });
      return; 
    }

    const inventory = await prisma.inventory.create({
      data: {
        ...parsedBody.data,
        histories: {
          create: {
            actionType: 'IN',
            quantityChange: parsedBody.data.quantity,
            lastQuantity: 0,
            newQuantity: parsedBody.data.quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    res.status(201).json(inventory);
  } catch (error) {

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.log(error);
        
        const conflictingFields = (error.meta?.target as string[]) || [];
        
        res.status(409).json({
          error: 'Conflict',
          message: `The following unique fields are already in use: ${conflictingFields.join(', ')}.`,
        });
        return;
      }
    }


    next(error);
  }
};

