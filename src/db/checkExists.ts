import { Prisma } from '@prisma/client';
import HttpError from '../errors/HttpError';

type ProjectType = Prisma.ProjectGetPayload<{
  select: {
    authorId: true;
    tasks: { select: { id: true; iniciatorId: true; performerId: true; beginAt: true } };
    users: { select: { id: true } };
  };
}>;

type TaskType = Prisma.TaskGetPayload<{
  select: { iniciatorId: true; performerId: true; beginAt: true };
}>;

const checkProjectExists = async (tx: Prisma.TransactionClient, projectId: number, authorId?: number) => {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      authorId: true,
      tasks: { select: { id: true, iniciatorId: true, performerId: true, beginAt: true } },
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
    throw new HttpError({ code: 401, message: 'You are not a member of this project.' });
  }
};

const checkAddedUser = (project: ProjectType, addedUserId: number) => {
  if (project.users.some(user => user.id === addedUserId)) {
    throw new HttpError({ code: 401, message: 'You are not a member of this project.' });
  }
};

const checkTaskExists = (project: ProjectType, taskId: number) => {
  const task = project.tasks.find(task => task.id === taskId);

  if (!task) throw new HttpError({ code: 404, message: 'Task not found.' });

  return task;
};

const checkUserIsInitiator = (task: TaskType, userId: number) => {
  if (task.iniciatorId !== userId) {
    throw new HttpError({
      code: 401,
      message: 'You cant assign yourself. You are not the initiator of this task.',
    });
  }
};

const checkUserIsPerformer = (task: TaskType, userId: number) => {
  if (task.performerId !== userId) {
    throw new HttpError({
      code: 401,
      message: 'You are not the performer of this task.',
    });
  }
};

const checkPerformerExists = async (tx: Prisma.TransactionClient, performerId: number) => {
  const performer = await tx.user.findUnique({
    where: { id: performerId },
  });

  if (!performer) {
    throw new HttpError({ code: 404, message: 'Performer not found.' });
  }

  return performer;
};

export {
  checkProjectExists,
  checkUserMembership,
  checkAddedUser,
  checkTaskExists,
  checkUserIsInitiator,
  checkUserIsPerformer,
  checkPerformerExists,
};
