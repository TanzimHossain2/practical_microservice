import { JWT_SECRET } from '@/config';
import prisma from '@/prisma';
import { AccessTokenSchema, DecodedTokenSchema } from '@/schemas';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate the request body
    const parsedBody = AccessTokenSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.errors,
      });
    }

    const { accessToken } = parsedBody.data;

    try {
      const decode = jwt.verify(accessToken, JWT_SECRET);

      const parsedDecode = DecodedTokenSchema.safeParse(decode);
      if (!parsedDecode.success) {
        return res.status(400).json({
          message: parsedDecode.error.errors,
        });
      }

      const { userId } = parsedDecode.data;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      return res.status(200).json({
        message: 'Authorized',
        user,
      });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: 'Token has expired',
        });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          message: 'Invalid token',
        });
      } else {
        throw err;
      }
    }
  } catch (err) {
    next(err);
  }
};

