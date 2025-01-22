import { Task } from '@prisma/client';
import prisma from './client';

const createTask = async (taskData: Pick<Task, 'title' | 'description' | 'deadline' | 'projectId'>) => {
  return await prisma.task.create({
    data: taskData,
  });
};

const assignTask = async (taskId: number, userId: number) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: { performerId: userId },
  });
};

export { createTask };
