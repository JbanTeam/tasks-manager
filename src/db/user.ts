import { User } from '@prisma/client';
import prisma from './client';

const getUsers = async () => {
  return await prisma.user.findMany({ include: { projects: true } });
};

const createUser = async (userData: Pick<User, 'name' | 'email' | 'password'>) => {
  return await prisma.user.create({
    data: userData,
  });
};

const userByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const userById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export { getUsers, createUser, userByEmail, userById };
