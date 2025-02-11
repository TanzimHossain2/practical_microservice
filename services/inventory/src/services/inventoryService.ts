import prisma from '@/prisma';
import { InventoryCreateDTOSchema } from '@/schemas';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const createInventoryService = async (data: any) => {
  // Validate the request body
  const parsedBody = InventoryCreateDTOSchema.safeParse(data);
  if (!parsedBody.success) {
    throw new Error('Invalid data: ' + parsedBody.error.errors.map((err) => err.message).join(', '));
  }

  try {
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

    return inventory;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const conflictingFields = (error.meta?.target as string[]) || [];
        throw new Error(`Conflict: The following unique fields are already in use: ${conflictingFields.join(', ')}`);
      }
    }
    throw error; 
  }
};
