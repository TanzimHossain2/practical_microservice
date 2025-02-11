import prisma from '@/prisma';
import { sendToQueue } from '@/queue';
import { UserCreateSchema } from '@/schemas';
import { generateVerificationCode } from '@/utils/generateCode';
import bcrypt from 'bcryptjs';
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

    // Create the User Profile. This will be handled by the user-profile-service
    sendToQueue(
      'user-profile-service',
      JSON.stringify({
        userId: user.id,
        name: user.name,
        email: user.email,
      })
    );

    // Generate a verification code
    const code = generateVerificationCode();

    // Save the verification code
    await prisma.verificationCode.create({
      data: {
        code,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours
      },
    });

    sendToQueue(
      'auth-email-service',
      JSON.stringify({
        recipient: user.email,
        subject: 'Verify Your Email Address',
        body: `Your verification code is ${code}`,
        source: 'user-registration',
      })
    );

    return res.status(201).json({
      message:
        'User created successfully. Check your email for verification code',
      user,
    });
  } catch (err) {
    next(err);
  }
};

