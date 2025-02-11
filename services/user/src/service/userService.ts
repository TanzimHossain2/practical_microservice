import prisma from '@/prisma';
import { UserCreateInput } from '@/schemas';

export const createUserService = async (data: UserCreateInput) => {
  try {
    // Check if the authUserId already exists
    const existingUser = await prisma.user.findUnique({
      where: { authUserId: data.authUserId },
    });

    console.log("existingUser", existingUser);
    

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create the new user in the database
    const user = await prisma.user.create({
      data,
    });

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating user: ${error.message}`);
    } else {
      throw new Error('Error creating user: Unknown error');
    }
  }
};

