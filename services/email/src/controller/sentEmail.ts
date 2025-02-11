import { DEFAULT_SENDER, transporter } from '@/config';
import prisma from '@/prisma';
import { EmailCreateSchema } from '@/schemas';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body
    const parsedBody = EmailCreateSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.errors);
    }

    //create email Options
    const { recipient, subject, body, sender, source } = parsedBody.data;
    const emailOption = {
      from: sender || DEFAULT_SENDER,
      to: recipient,
      subject,
      text: body,
    };

    const { rejected } = await transporter.sendMail(emailOption);

    if (rejected.length) {
      console.log(chalk.red(`Email rejected: ${rejected}`));
      return res.status(400).json({ message: 'Email rejected', rejected });
    }

    await prisma.email.create({
      data: {
        sender: sender || DEFAULT_SENDER,
        recipient,
        subject,
        body,
        source,
      },
    });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    next(error);
  }
};

