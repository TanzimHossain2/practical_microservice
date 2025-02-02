import { INVENTORY_URL } from '@/config';
import prisma from '@/prisma';
import { ProductCreateDTOSchema } from '@/schemas';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import axios from 'axios';
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

    // Validate request body
    const parsedBody = ProductCreateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.errors,
      });
    }

    // check if product with the same sku already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: parsedBody.data.sku,
      },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ message: 'Product with the same SKU already exists' });
    }

    // Create product
    const product = await prisma.product.create({
      data: parsedBody.data,
    });

    console.log(chalk.green('🚀 Product created successfully'), product.id);

    // Create inventory record for the product
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );

    console.log(chalk.green('📦 Inventory created successfully'), inventory.id);

    // update product and store inventory id
    await prisma.product.update({
      where: { id: product.id },
      data: {
        inventoryId: inventory.id,
      },
    });
    console.log(
      chalk.green('🚀 Product updated successfully with inventory id'),
      inventory.id
    );

    res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        console.log(err);

        const conflictingFields = (err.meta?.target as string[]) || [];

        return res.status(409).json({
          error: 'Conflict',
          message: `The following unique fields are already in use: ${conflictingFields.join(
            ', '
          )}.`,
        });
      }
    }
    next(err);
  }
};

