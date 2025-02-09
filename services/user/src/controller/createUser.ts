import { UserCreateSchema } from '@/schemas';
import { createUserService } from '@/service/userService';
import { NextFunction, Request, Response } from 'express';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body
    const parsedBody = UserCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ message: parsedBody.error.errors });
    }

    // Call the service to handle user creation
    const user = await createUserService(parsedBody.data);

    // Return the response with the newly created user
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

