import { Prisma, TaskStatus } from '@prisma/client';

import HttpError from '../errors/HttpError';
import { timeDifference } from '../utils/time';
import { ProjectType, TaskType, TaskUpdateData } from '../types';

const checkProjectExists = async (tx: Prisma.TransactionClient, projectId: number, authorId?: number) => {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      authorId: true,
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
      users: { select: { id: true } },
    },
  });

  if (!project) throw new HttpError({ code: 404, message: 'Project not found.' });

  if (authorId && project.authorId !== authorId) {
    throw new HttpError({ code: 401, message: 'You are not the owner of this project.' });
  }

  return project;
};

const checkUserMembership = (project: ProjectType, userId: number) => {
  if (!project.users.some(user => user.id === userId)) {
    throw new HttpError({ code: 400, message: 'User is not a member of this project.' });
  }
};

const checkAddedUser = (project: ProjectType, addedUserId: number) => {
  if (project.users.some(user => user.id === addedUserId)) {
    throw new HttpError({ code: 400, message: 'User is already a member of this project.' });
  }
};

const checkTaskExists = (project: ProjectType, taskId: number) => {
  const task = project.tasks.find(task => task.id === taskId);

  if (!task) throw new HttpError({ code: 404, message: 'Task not found.' });

  return task;
};

const checkTaskStatus = (task: TaskType, newStatus: TaskStatus) => {
  const taskData: TaskUpdateData = { status: newStatus };

  if (newStatus === task.status) {
    throw new HttpError({ code: 400, message: 'Task is already in this status.' });
  }

  if (newStatus === TaskStatus.CREATED) {
    throw new HttpError({ code: 400, message: 'Task cannot be marked CREATED.' });
  }

  if (newStatus === TaskStatus.IN_PROGRESS) {
    if (task.status !== TaskStatus.CREATED) {
      throw new HttpError({ code: 400, message: 'Task can only be marked IN_PROGRESS from CREATED.' });
    }
    taskData.beginAt = new Date();
  } else if (newStatus === TaskStatus.DONE) {
    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new HttpError({ code: 400, message: 'Task can only be marked DONE from IN_PROGRESS.' });
    }

    taskData.doneAt = new Date();

    if (task.beginAt) {
      const { ms } = timeDifference(task.beginAt, taskData.doneAt);
      taskData.spentTime = ms;
    }
  }

  return taskData;
};

const checkUserIsInitiator = (task: TaskType, userId: number) => {
  if (task.iniciatorId !== userId) {
    throw new HttpError({
      code: 400,
      message: 'You cant assign yourself. You are not the initiator of this task.',
    });
  }
};

const checkUserIsPerformer = (task: TaskType, userId: number) => {
  if (task.performerId !== userId) {
    throw new HttpError({
      code: 400,
      message: 'You are not the performer of this task.',
    });
  }
};

const checkUserExists = async (tx: Prisma.TransactionClient, userId: number) => {
  const user = await tx.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError({ code: 404, message: 'User not found.' });
  }
};

export {
  checkProjectExists,
  checkUserMembership,
  checkAddedUser,
  checkTaskExists,
  checkTaskStatus,
  checkUserIsInitiator,
  checkUserIsPerformer,
  checkUserExists,
};
