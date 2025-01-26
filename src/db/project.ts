import { Project } from '@prisma/client';
import prisma from './client';
import { checkAddedUser, checkProjectExists, TaskType } from './checkExists';
import { timeDifference } from '../utils';
import { TaskStatus } from '../constants';

const getProjects = async () => {
  return await prisma.project.findMany({ include: { tasks: true, users: { select: { id: true } } } });
};

const projectsByUser = async (userId: number) => {
  return await prisma.project.findMany({
    where: { users: { some: { id: { equals: userId } } } },
    include: { tasks: { select: { status: true, performerId: true, performer: { select: { name: true } } } } },
  });
};

const createProject = async (projectData: Pick<Project, 'title' | 'description' | 'authorId'>) => {
  return await prisma.project.create({
    data: { ...projectData, users: { connect: { id: projectData.authorId } } },
  });
};

async function userToPoject(projectId: number, authorId: number, addedUserId: number) {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists(tx, projectId, authorId);

    checkAddedUser(project, addedUserId);

    await tx.project.update({
      where: { id: projectId },
      data: { users: { connect: { id: addedUserId } } },
    });
  });
}

async function pojectTime(projectId: number) {
  const project = await checkProjectExists(prisma, projectId);

  const now = new Date();
  const totalMillisec = project.tasks.reduce((acc: number, task: TaskType) => {
    if (task.status === TaskStatus.IN_PROGRESS) {
      const { diffInMillisec } = timeDifference(task.beginAt, now);
      acc += diffInMillisec;
    } else if (task.status === TaskStatus.DONE) {
      acc += Number(task.spentTime);
    }
    return acc;
  }, 0);

  return totalMillisec;
}

export { getProjects, projectsByUser, createProject, userToPoject, pojectTime };
