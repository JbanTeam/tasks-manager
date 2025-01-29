import { Task, TaskStatus } from '@prisma/client';
import prisma from '../prismaClient';
import { TaskUpdateData } from '../../types';
import { timeDifference } from '../../utils/time';
import {
  checkProjectExists,
  checkTaskExists,
  checkTaskStatus,
  checkUserExists,
  checkUserIsInitiator,
  checkUserIsPerformer,
  checkUserMembership,
} from '../checkExists';

async function createTask(taskData: Pick<Task, 'title' | 'description' | 'deadline' | 'projectId'>, userId: number) {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists(tx, taskData.projectId);
    checkUserMembership(project, userId);

    return await tx.task.create({
      data: { ...taskData, iniciatorId: userId },
    });
  });
}

const assignTask = async (taskId: number, userId: number, projectId: number, performerId: number) => {
  return await prisma.$transaction(async tx => {
    await checkUserExists(tx, performerId);

    const project = await checkProjectExists(tx, projectId);
    checkUserMembership(project, userId);
    checkUserMembership(project, performerId);

    const task = checkTaskExists(project, taskId);
    checkUserIsInitiator(task, userId);

    return await tx.task.update({
      where: { id: taskId },
      data: { performerId },
    });
  });
};

const updateTaskStatus = async (taskId: number, projectId: number, userId: number, newStatus: TaskStatus) => {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists(tx, projectId);
    checkUserMembership(project, userId);

    const task = checkTaskExists(project, taskId);
    checkUserIsPerformer(task, userId);

    const taskData = checkTaskStatus(task, newStatus);

    return await tx.task.update({
      where: { id: taskId },
      data: taskData,
    });
  });
};

export { createTask, assignTask, updateTaskStatus };
