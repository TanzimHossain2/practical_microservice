import prisma from "@/prisma";
import { ProductUpdateDTOSchema } from "@/schemas";
import { NextFunction,Response,Request } from "express";

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request body
    const parsedBody = ProductUpdateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // check if the product exists
		const product = await prisma.product.findUnique({
			where: {
				id: req.params.id,
			},
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

    // update the product
    await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...parsedBody.data,
      },
    });


    return res.status(200).json({ message: 'Product updated successfully' });
    
  } catch (err) {
    next(err);
  }
}