import { Prisma, TaskStatus } from '@prisma/client';

import HttpError from '../errors/HttpError';
import { timeDifference } from '../utils/time';
import { ProjectFullType, TaskType, TaskUpdateData } from '../types';
import { projectFullSelect } from './selects/project.select';

const checkProjectExists = async ({
  tx,
  projectId,
}: {
  tx: Prisma.TransactionClient;
  projectId: number;
}): Promise<ProjectFullType> => {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: projectFullSelect,
  });

  if (!project) throw new HttpError({ code: 404, message: 'Project not found.' });

  return project;
};

const checkUserMembership = ({ project, userId }: { project: ProjectFullType; userId: number }): void => {
  if (!project.users.some(user => user.id === userId)) {
    throw new HttpError({ code: 400, message: 'User is not a member of this project.' });
  }
};

const checkUserIsAuthor = ({ userId, authorId }: { userId: number; authorId: number }): void => {
  if (userId !== authorId) {
    throw new HttpError({
      code: 400,
      message: 'You are not the author of this project.',
    });
  }
};

const checkAddedUser = ({ project, addedUserId }: { project: ProjectFullType; addedUserId: number }): void => {
  if (project.users.some(user => user.id === addedUserId)) {
    throw new HttpError({ code: 400, message: 'User is already a member of this project.' });
  }
};
const checkRemovedUser = ({ project, removedUserId }: { project: ProjectFullType; removedUserId: number }): void => {
  if (!project.users.some(user => user.id === removedUserId)) {
    throw new HttpError({ code: 400, message: 'User is not a member of this project.' });
  }
};

const checkTaskExists = ({ project, taskId }: { project: ProjectFullType; taskId: number }): TaskType => {
  const task = project.tasks.find(task => task.id === taskId);

  if (!task) throw new HttpError({ code: 404, message: 'Task not found.' });

  return task;
};

const checkTaskStatus = ({ task, newStatus }: { task: TaskType; newStatus: TaskStatus }): TaskUpdateData => {
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

const checkUserIsInitiator = ({ iniciatorId, userId }: { iniciatorId: number | null; userId: number }): void => {
  if (iniciatorId !== userId) {
    throw new HttpError({
      code: 400,
      message: 'You cant assign yourself. You are not the initiator of this task.',
    });
  }
};

const checkUserIsPerformer = ({ performerId, userId }: { performerId: number | null; userId: number }): void => {
  if (performerId !== userId) {
    throw new HttpError({
      code: 400,
      message: 'You are not the performer of this task.',
    });
  }
};

const checkUserExists = async ({ tx, userId }: { tx: Prisma.TransactionClient; userId: number }): Promise<void> => {
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
  checkUserIsAuthor,
  checkAddedUser,
  checkRemovedUser,
  checkTaskExists,
  checkTaskStatus,
  checkUserIsInitiator,
  checkUserIsPerformer,
  checkUserExists,
};
