import { User } from '@prisma/client';
import prisma from './client';

const getUsers = async () => {
  return await prisma.user.findMany();
};

const createUser = async (userData: Pick<User, 'name' | 'email' | 'password'>) => {
  return await prisma.user.create({
    data: userData,
  });
};

const usersCount = async () => {
  return await prisma.user.count();
};

const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export { getUsers, createUser, getUserByEmail, getUserById, usersCount };
