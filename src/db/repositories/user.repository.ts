import { User } from '@prisma/client';

import prisma from '../prismaClient';
import { UserFullType } from '@src/types';
import { userFullSelect } from '../selects/user.select';

export class UserRepository {
  getUsers = async (): Promise<UserFullType[]> => {
    return await prisma.user.findMany({
      select: userFullSelect,
    });
  };

  createUser = async (userData: Pick<User, 'name' | 'email' | 'password'>): Promise<User> => {
    return await prisma.user.create({
      data: userData,
    });
  };

  findUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { email },
    });
  };

  findUserById = async (id: number): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { id },
    });
  };

  updateRefreshToken = async ({
    userId,
    refreshToken,
  }: {
    userId: number;
    refreshToken: string | null;
  }): Promise<void> => {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken } });
  };
}
