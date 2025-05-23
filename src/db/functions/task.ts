import { Task, TaskStatus } from '@prisma/client';

import prisma from '../prismaClient';

import {
  checkProjectExists,
  checkTaskExists,
  checkTaskStatus,
  checkUserExists,
  checkUserIsInitiator,
  checkUserIsPerformer,
  checkUserMembership,
} from '../checkExists';

type CreateTaskData = {
  taskData: Pick<Task, 'title' | 'description' | 'deadline' | 'projectId'>;
  userId: number;
};

type AssignTaskData = {
  taskId: number;
  userId: number;
  projectId: number;
  performerId: number;
};

type UpdateTaskStatusData = {
  taskId: number;
  projectId: number;
  userId: number;
  newStatus: TaskStatus;
};

async function createTask({ taskData, userId }: CreateTaskData) {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists({ tx, projectId: taskData.projectId });
    checkUserMembership({ project, userId });

    return await tx.task.create({
      data: { ...taskData, iniciatorId: userId },
    });
  });
}

const assignTask = async ({ taskId, userId, projectId, performerId }: AssignTaskData) => {
  return await prisma.$transaction(async tx => {
    await checkUserExists({ tx, userId: performerId });

    const project = await checkProjectExists({ tx, projectId });
    checkUserMembership({ project, userId });
    checkUserMembership({ project, userId: performerId });

    const task = checkTaskExists({ project, taskId });
    checkUserIsInitiator({ iniciatorId: task.iniciatorId, userId });

    return await tx.task.update({
      where: { id: taskId },
      data: { performerId },
    });
  });
};

const updateTaskStatus = async ({ taskId, projectId, userId, newStatus }: UpdateTaskStatusData) => {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists({ tx, projectId });
    checkUserMembership({ project, userId });

    const task = checkTaskExists({ project, taskId });
    checkUserIsPerformer({ performerId: task.performerId, userId });

    const taskData = checkTaskStatus({ task, newStatus });

    return await tx.task.update({
      where: { id: taskId },
      data: taskData,
    });
  });
};

const deleteTask = async ({ taskId, projectId, userId }: Omit<UpdateTaskStatusData, 'newStatus'>) => {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists({ tx, projectId });
    checkUserMembership({ project, userId });

    const task = checkTaskExists({ project, taskId });
    checkUserIsInitiator({ iniciatorId: task.iniciatorId, userId });

    return await tx.task.delete({
      where: { id: taskId },
    });
  });
};

export { createTask, assignTask, updateTaskStatus, deleteTask };
