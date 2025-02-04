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
    // validate request body
    const parsedBody = CartItemSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    let cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

    // if cart session id is present in the request header and exists in the store

    if (cartSessionId) {
      const exist = await redis.exists(`session:${cartSessionId}`);
      console.log('Session exists', exist);

      if (!exist) {
        console.log('[addToCart] Session does not exist', cartSessionId);

        cartSessionId = null;
      }
    }

    // if cart session id is not present , create a new session
    if (!cartSessionId) {
      cartSessionId = uuid();
      console.log('[addToCart] New session created', cartSessionId);

      // set the cart session id in the redis store
      await redis.setex(`session:${cartSessionId}`, CART_TTL, cartSessionId);

      // set the cart session id in the response header
      res.setHeader('x-cart-session-id', cartSessionId);
    }

    //check  if the inventory is available
    try {
      const { data } = await axios.get(
        `${INVENTORY_SERVICE}/inventories/${parsedBody.data.inventoryId}`
      );

      if (Number(data.quantity) < parsedBody.data.quantity) {
        return res.status(400).json({ message: 'Inventory not available' });
      }
    } catch (err) {
      console.log('Inventory not available', err);
    }

    // check if the item is already in the cart
    const itemExists = await redis.hexists(
      `cart:${cartSessionId}`,
      parsedBody.data.productId
    );

    // todo logic: parsedbody.data.quantity - existing quantity. if quantity have 1 and next time add 5 then it update to 5
    

    // add item to cart
    await redis.hset(
      `cart:${cartSessionId}`,
      parsedBody.data.productId,
      JSON.stringify({
        inventoryId: parsedBody.data.inventoryId,
        quantity: parsedBody.data.quantity,
      })
    );

    // update Inventory
    try {
      await axios.put(
        `${INVENTORY_SERVICE}/inventories/${parsedBody.data.inventoryId}`,
        {
          quantity: parsedBody.data.quantity, //todo inventory increment decrement logic later
          actionType: 'OUT',
        }
      );
    } catch (error) {
      console.log('Error updating inventory', error);
    }

    res.status(200).json({ message: 'Item added to cart', cartSessionId });

    //todo update inventory
  } catch (err) {
    next(err);
  }
};

