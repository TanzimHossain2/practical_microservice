import { CART_TTL, INVENTORY_SERVICE } from '@/config';
import { redis } from '@/redis';
import { CartItemSchema } from '@/schemas';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const parsedBody = CartItemSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    let cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

    // If cart session id is present in the request header and exists in the store
    if (cartSessionId) {
      const exist = await redis.exists(`session:${cartSessionId}`);
      console.log('Session exists', exist);

      if (!exist) {
        console.log('[addToCart] Session does not exist', cartSessionId);
        cartSessionId = null;
      }
    }

    // If cart session id is not present, create a new session
    if (!cartSessionId) {
      cartSessionId = uuid();
      console.log('[addToCart] New session created', cartSessionId);

      // Set the cart session id in the redis store
      await redis.setex(`session:${cartSessionId}`, CART_TTL, cartSessionId);

      // Set the cart session id in the response header
      res.setHeader('x-cart-session-id', cartSessionId);
    }

    // Check if the item is already in the cart
    const existingItem = await redis.hget(
      `cart:${cartSessionId}`,
      parsedBody.data.productId
    );

    let existingQuantity = 0;
    if (existingItem) {
      existingQuantity = JSON.parse(existingItem).quantity;
    }

    // Calculate the actual quantity difference
    const quantityDifference = parsedBody.data.quantity - existingQuantity;

    // If increasing quantity, check inventory availability
    if (quantityDifference > 0) {
      try {
        const { data } = await axios.get(
          `${INVENTORY_SERVICE}/inventories/${parsedBody.data.inventoryId}`
        );

        if (Number(data.quantity) < quantityDifference) {
          return res.status(400).json({ message: 'Inventory not available' });
        }
      } catch (err) {
        console.log('Inventory check failed', err);
        return res.status(500).json({ message: 'Error checking inventory' });
      }
    }

    // Add item to cart
    await redis.hset(
      `cart:${cartSessionId}`,
      parsedBody.data.productId,
      JSON.stringify({
        inventoryId: parsedBody.data.inventoryId,
        quantity: parsedBody.data.quantity,
      })
    );

    // Update inventory
    if (quantityDifference !== 0) {
      try {
        await axios.put(
          `${INVENTORY_SERVICE}/inventories/${parsedBody.data.inventoryId}`,
          {
            quantity: Math.abs(quantityDifference),
            actionType: quantityDifference > 0 ? 'OUT' : 'IN',
          }
        );
      } catch (error) {
        console.log('Error updating inventory', error);
      }
    }

    res.status(200).json({ message: 'Item added to cart', cartSessionId });
  } catch (err) {
    next(err);
  }
};

