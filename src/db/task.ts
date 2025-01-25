import { Task, TaskStatus } from '@prisma/client';
import prisma from './client';
import HttpError from '../errors/HttpError';
import { timeDifference } from '../utils';

type TaskUpdateData = {
  status: TaskStatus;
  beginAt?: Date;
  doneAt?: Date;
  spentTime?: string;
};

async function createTask(taskData: Pick<Task, 'title' | 'description' | 'deadline' | 'projectId'>, userId: number) {
  return await prisma.$transaction(async tx => {
    const project = await tx.project.findUnique({
      where: { id: taskData.projectId },
      select: { users: { select: { id: true } } },
    });

    if (!project) throw new HttpError({ code: 404, message: 'Project not found.' });

    if (!project.users.some(user => user.id === userId)) {
      throw new HttpError({ code: 401, message: 'You are not a member of this project.' });
    }

    await tx.task.create({
      data: { ...taskData, iniciatorId: userId },
    });
  });
}

const assignTask = async (taskId: number, userId: number, projectId: number, performerId: number) => {
  return await prisma.$transaction(async tx => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      select: { tasks: { select: { id: true, iniciatorId: true } }, users: { select: { id: true } } },
    });

    if (!project) throw new HttpError({ code: 404, message: 'Project not found.' });

    if (!project.users.some(user => user.id === userId)) {
      throw new HttpError({ code: 401, message: 'You are not a member of this project.' });
    }

    const performer = await tx.user.findUnique({
      where: { id: performerId },
    });

    if (!performer) {
      throw new HttpError({ code: 404, message: 'Performer not found.' });
    }

    const task = project.tasks.find(task => task.id === taskId);

    if (!task) throw new HttpError({ code: 404, message: 'Task not found.' });

    if (task.iniciatorId !== userId) {
      throw new HttpError({
        code: 401,
        message: 'You cant assign yourself to this task. You are not the initiator of this task.',
      });
    }

    await tx.task.update({
      where: { id: taskId },
      data: { performerId },
    });
  });
};

const updateTaskStatus = async (taskId: number, projectId: number, userId: number, status: TaskStatus) => {
  return await prisma.$transaction(async tx => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      select: { tasks: { select: { id: true, performerId: true, beginAt: true } }, users: { select: { id: true } } },
    });

    if (!project) throw new HttpError({ code: 404, message: 'Project not found.' });

    if (!project.users.some(user => user.id === userId)) {
      throw new HttpError({ code: 401, message: 'You are not a member of this project.' });
    }

    const task = project.tasks.find(task => task.id === taskId);

    if (!task) throw new HttpError({ code: 404, message: 'Task not found.' });

    if (task.performerId !== userId) {
      throw new HttpError({
        code: 401,
        message: 'You cant change status of this task. You are not the performer.',
      });
    }

    const taskData: TaskUpdateData = { status };

    if (status === TaskStatus.IN_PROGRESS) {
      taskData.beginAt = new Date();
    } else if (status === TaskStatus.DONE) {
      taskData.doneAt = new Date();

      const { days, hours, minutes } = timeDifference(taskData.beginAt, taskData.doneAt);

      taskData.spentTime = `${days}d ${hours}h ${minutes}m`;
    }

    await tx.task.update({
      where: { id: taskId },
      data: taskData,
    });
  });
};

export { createTask, assignTask, updateTaskStatus };
