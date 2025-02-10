import { INVENTORY_URL } from '@/config';
import prisma from '@/prisma';
import { ProductCreateDTOSchema } from '@/schemas';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import axios from 'axios';

export const createProductService = async (data: any) => {
  // Validate request data
  const parsedBody = ProductCreateDTOSchema.safeParse(data);
  if (!parsedBody.success) {
    throw new Error(
      'Invalid request body: ' +
        parsedBody.error.errors.map((err) => err.message).join(', ')
    );
  }

  // Check if a product with the same SKU already exists
  const existingProduct = await prisma.product.findFirst({
    where: { sku: parsedBody.data.sku },
  });

  if (existingProduct) {
    throw new Error('Product with the same SKU already exists');
  }

  try {
    // Create the product
    const product = await prisma.product.create({
      data: parsedBody.data,
    });

    // Call Inventory API to create an inventory record
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );

    // Update product with inventoryId
    await prisma.product.update({
      where: { id: product.id },
      data: { inventoryId: inventory.id },
    });

    return { ...product, inventoryId: inventory.id };
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      const conflictingFields = (err.meta?.target as string[]) || [];
      throw new Error(
        `Conflict: The following unique fields are already in use: ${conflictingFields.join(
          ', '
        )}.`
      );
    }
    throw err;
  }
};

