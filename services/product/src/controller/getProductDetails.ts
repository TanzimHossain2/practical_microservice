import { getProductDetailsService } from '@/service';
import { NextFunction, Request, Response } from 'express';

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.id) {
      throw { status: 400, message: 'Product id is required' };
    }
    const productDetails = await getProductDetailsService(req.params.id);

    res.status(200).json(productDetails);
  } catch (error) {
    console.error('Error retrieving product details:', error);
    next(error);
  }
};

