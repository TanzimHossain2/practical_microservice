import { z } from 'zod';

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(255),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

export const AccessTokenSchema = z.object({
  accessToken: z.string(),
});

export const EmailVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string(),
});


export const DecodedTokenSchema = z.object({
  userId: z.string(),
  role: z.string().optional(),
})