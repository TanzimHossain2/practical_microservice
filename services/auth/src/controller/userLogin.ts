import { JWT_SECRET } from '@/config';
import prisma from '@/prisma';
import { UserLoginSchema } from '@/schemas';
import { LoginAttemptStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type LoginHistory = {
  userId: string;
  userAgent: string | undefined;
  ipAddress: string | undefined;
  attempt: LoginAttemptStatus;
};

const createLoginHistory = async (loginHistory: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: loginHistory.userId,
      userAgent: loginHistory.userAgent,
      ipAddress: loginHistory.ipAddress,
      attempt: loginHistory.attempt,
    },
  });
};

export const UserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';

    // validate the request body
    const parsedBody = UserLoginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.errors,
      });
    }

    // check if the user exists
    const User = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (!User) {
      await createLoginHistory({
        userId: '00000000-0000-0000-0000-000000000000',
        userAgent,
        ipAddress,
        attempt: LoginAttemptStatus.FAILED,
      });

      return res.status(400).json({
        message: 'User does not exist',
      });
    }

    // check if the password is correct
    const isMatch = await bcrypt.compare(
      parsedBody.data.password,
      User.password
    );

    if (!isMatch) {
      await createLoginHistory({
        userId: User.id,
        userAgent,
        ipAddress,
        attempt: LoginAttemptStatus.FAILED,
      });

      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    // check if the user is verified
    if (!User.verified) {
      await createLoginHistory({
        userId: User.id,
        userAgent,
        ipAddress,
        attempt: LoginAttemptStatus.FAILED,
      });

      return res.status(400).json({
        message: 'User is not verified',
      });
    }

    // check if the account is active
    if (User.status !== 'ACTIVE') {
      await createLoginHistory({
        userId: User.id,
        userAgent,
        ipAddress,
        attempt: LoginAttemptStatus.FAILED,
      });

      return res.status(400).json({
        message: `Your account is ${User.status.toLowerCase()}`,
      });
    }

    // generate Access Token
    const accessToken = jwt.sign(
      {
        userId: User.id,
        email: User.email,
        role: User.role,
        name: User.name,
      },
      JWT_SECRET!,
      { expiresIn: '2h' }
    );

    await createLoginHistory({
      userId: User.id,
      userAgent,
      ipAddress,
      attempt: LoginAttemptStatus.SUCCESS,
    });

    // send the response
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
    });
  } catch (err) {
    console.log(chalk.red(err));
    next(err);
  }
};

