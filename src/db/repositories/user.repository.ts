import { User } from '@prisma/client';

import prisma from '../prismaClient';

export class UserRepository {
  public getUsers = async (): Promise<User[]> => {
    return await prisma.user.findMany({
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            authorId: true,
            users: { select: { id: true } },
            tasks: {
              select: {
                id: true,
                iniciatorId: true,
                performerId: true,
                beginAt: true,
                doneAt: true,
                spentTime: true,
                status: true,
              },
            },
          },
        },
      },
    });
  };

  public createUser = async (userData: Pick<User, 'name' | 'email' | 'password'>): Promise<User> => {
    return await prisma.user.create({
      data: userData,
    });
  };

  public findUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { email },
    });
  };

  public findUserById = async (id: number): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { id },
    });
  };

  public updateRefreshToken = async ({
    userId,
    refreshToken,
  }: {
    userId: number;
    refreshToken: string | null;
  }): Promise<void> => {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken } });
  };
}
