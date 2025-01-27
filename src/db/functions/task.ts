import { Task, TaskStatus } from '@prisma/client';
import prisma from '../prismaClient';
import { timeDifference } from '../../utils';
import {
  checkPerformerExists,
  checkProjectExists,
  checkTaskExists,
  checkUserIsInitiator,
  checkUserIsPerformer,
  checkUserMembership,
} from '../checkExists';

type TaskUpdateData = {
  status: TaskStatus;
  beginAt?: Date;
  doneAt?: Date;
  spentTime?: number;
};

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
    const project = await checkProjectExists(tx, projectId);
    checkUserMembership(project, userId);
    checkUserMembership(project, performerId);

    await checkPerformerExists(tx, performerId);

    const task = checkTaskExists(project, taskId);
    checkUserIsInitiator(task, userId);

    return await tx.task.update({
      where: { id: taskId },
      data: { performerId },
    });
  });
};

const updateTaskStatus = async (taskId: number, projectId: number, userId: number, status: TaskStatus) => {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists(tx, projectId);
    checkUserMembership(project, userId);

    const task = checkTaskExists(project, taskId);
    checkUserIsPerformer(task, userId);

    const taskData: TaskUpdateData = { status };

    if (status === TaskStatus.IN_PROGRESS) {
      taskData.beginAt = new Date();
    } else if (status === TaskStatus.DONE) {
      taskData.doneAt = new Date();

      const { ms } = timeDifference(task.beginAt, taskData.doneAt);

      taskData.spentTime = ms;
    }

    return await tx.task.update({
      where: { id: taskId },
      data: taskData,
    });
  });
};

export { createTask, assignTask, updateTaskStatus };
