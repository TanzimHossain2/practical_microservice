
import { INVENTORY_URL } from '@/config';
import prisma from '@/prisma';
import axios from 'axios';
import chalk from 'chalk';

export const getProductDetailsService = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw { status: 404, message: 'Product not found' };
  }

  if (product.inventoryId === null) {
    const { data: inventory } = await axios.post(`${INVENTORY_URL}/inventories`, {
      productId: product.id,
      sku: product.sku,
    });

    console.log(chalk.green('📦 Inventory created successfully'), inventory.id);

    await prisma.product.update({
      where: { id: product.id },
      data: { inventoryId: inventory.id },
    });

    console.log(chalk.green('🚀 Product updated successfully with inventory id'), inventory.id);

    return {
      ...product,
      inventoryId: inventory.id,
      stock: inventory.quantity || 0,
      stockStatus: inventory.quantity > 0 ? 'In stock' : 'Out of stock',
    };
  }

  // Fetch existing inventory
  const { data: inventory } = await axios.get(`${INVENTORY_URL}/inventories/${product.inventoryId}`);

  return {
    ...product,
    stock: inventory.quantity || 0,
    stockStatus: inventory.quantity > 0 ? 'In stock' : 'Out of stock',
  };
};
