import { USER_SERVICE } from '@/config';
import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //validate the request body
    const parsedBody = UserCreateSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.errors,
      });
    }

    //check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    console.log(salt);
    const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

    //create the user
    const user = await prisma.user.create({
      data: {
        ...parsedBody.data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        verified: true,
        name: true,
      },
    });
    console.log(chalk.green('User created successfully'));

    // Create the User Profile cby calling the user profile service

    try {
      await axios.post(`${USER_SERVICE}/users`, {
        authUserId: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (err) {
      console.error(`Error creating user profile: ${err}`);
    }

    // todo: generate email verification token

    // todo: send email verification link

    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (err) {
    console.error(chalk.red(err));
    next(err);
  }
};

