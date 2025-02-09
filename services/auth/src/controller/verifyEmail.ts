import prisma from '@/prisma';
import { sendToQueue } from '@/queue';
import { EmailVerificationSchema } from '@/schemas';
import { AccountStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body
    const parsedBody = EmailVerificationSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // check if the user with email exists
    const user = await prisma.user.findUnique({
      where: { email: parsedBody.data.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // find the verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: parsedBody.data.code,
      },
    });

    if (!verificationCode) {
      return res.status(404).json({ message: 'Invalid verification code' });
    }

    // if the code has expired
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // update the user email status
    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true, status: AccountStatus.ACTIVE },
    });

    // update verification code status to used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { status: 'VERIFIED', verifiedAt: new Date() },
    });

    // send Success email
    sendToQueue(
      'auth-email-service',
      JSON.stringify({
        recipient: user.email,
        subject: 'Email Verified',
        body: 'Your email has been verified successfully',
        source: 'verify email',
      })
    );
    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

