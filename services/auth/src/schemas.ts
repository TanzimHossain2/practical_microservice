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
