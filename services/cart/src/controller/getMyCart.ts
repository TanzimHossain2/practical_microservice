import { redis } from '@/redis';
import { NextFunction, Request, Response } from 'express';
export const getMyCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

    if (!cartSessionId) {
      return res.status(200).json({ items: [] });
    }

    // check if the session exists
    const session = await redis.exists(`session:${cartSessionId}`);

    if (!session) {
      await redis.del(`cart:${cartSessionId}`);
      return res.status(200).json({ items: [] });
    }

    const cartItems = await redis.hgetall(`cart:${cartSessionId}`);

    if (Object.keys(cartItems).length === 0) {
      return res.status(200).json({ items: [] });
    }

    const items = Object.keys(cartItems).map((key) => {
      return {
        productId: key,
        ...JSON.parse(cartItems[key]),
      }
    });

    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
};
