import { z } from 'zod';

export const UserCreateSchema = z.object({
  authUserId: z.string(),
  name: z.string(),
  email: z.string().email(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = UserCreateSchema.omit({
  authUserId: true,
}).partial();

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
