import { CART_SERVICE, PRODUCT_SERVICE } from '@/config';
import prisma from '@/prisma';
import { sendToQueue } from '@/queue';
import { CartItemSchema, OrderSchema } from '@/schemas';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request
    const parsedBody = OrderSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // get cart details
    const { data: cartData } = await axios.get(`${CART_SERVICE}/cart/me`, {
      headers: {
        'x-cart-session-id': parsedBody.data.cartSessionId,
      },
    });

    const cartItems = z.array(CartItemSchema).safeParse(cartData.items);
    if (!cartItems.success) {
      return res.status(400).json({ errors: cartItems.error.errors });
    }

    if (cartItems.data.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // get product details from cart items
    const productDetails = await Promise.all(
      cartItems.data.map(async (item) => {
        const { data: product } = await axios.get(
          `${PRODUCT_SERVICE}/products/${item.productId}`
        );
        return {
          productId: product.id as string,
          productName: product.name as string,
          sku: product.sku as string,
          price: product.price as number,
          quantity: item.quantity,
          total: product.price * item.quantity,
        };
      })
    );

    const subtotal = productDetails.reduce((acc, item) => acc + item.total, 0);

    // TODO: will handle tax calculation later
    const tax = 0;
    const grandTotal = subtotal + tax;

    // create order
    const order = await prisma.order.create({
      data: {
        userId: parsedBody.data.userId,
        userName: parsedBody.data.userName,
        userEmail: parsedBody.data.userEmail,
        subtotal,
        tax,
        grandTotal,
        orderItems: {
          create: productDetails.map((item) => ({
            ...item,
          })),
        },
      },
    });

    console.log('Order created:', order.id);

    sendToQueue(
      'order-email-service',
      JSON.stringify({
        recipient: parsedBody.data.userEmail,
        subject: 'Order Confirmation',
        body: `Thank you for your order. Your order id is ${order.id}. Your order total is $${grandTotal}`,
        source: 'OrderService',
      })
    );

    sendToQueue(
      'clear-cart',
      JSON.stringify({ cartSessionId: parsedBody.data.cartSessionId })
    );

    res.status(201).json({ message: 'Order created successfully' });
  } catch (err) {
    next(err);
  }
};

