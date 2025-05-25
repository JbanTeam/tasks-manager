import { Project } from '@prisma/client';

import prisma from '../prismaClient';
import { calculateProjectTime } from '../../services/projectService';
import {
  DeleteProjectParams,
  DeveloperTimeParams,
  ProjectTimeParams,
  UserFromProjectParams,
  UserToProjectParams,
} from '@src/types/dbTypes';
import {
  checkAddedUser,
  checkProjectExists,
  checkRemovedUser,
  checkUserExists,
  checkUserIsAuthor,
} from '../checkExists';
import { ProjectType } from '@src/types';

const getProjects = async () => {
  return await prisma.project.findMany({ include: { tasks: true, users: { select: { id: true } } } });
};

const projectsByUser = async (userId: number) => {
  return await prisma.project.findMany({
    where: { users: { some: { id: { equals: userId } } } },
    include: { tasks: { select: { status: true, performerId: true, performer: { select: { name: true } } } } },
  });
};

const projectsForDevTime = async ({ devId, projectIds }: DeveloperTimeParams) => {
  let projects: ProjectType[];

  if (projectIds?.length) {
    projects = await prisma.project.findMany({
      where: { id: { in: projectIds }, users: { some: { id: devId } } },
      include: {
        tasks: {
          where: { performerId: devId },
        },
        users: { select: { id: true } },
      },
    });
  } else {
    projects = await prisma.project.findMany({
      where: { users: { some: { id: devId } } },
      include: {
        tasks: {
          where: { performerId: devId },
        },
        users: { select: { id: true } },
      },
    });
  }

  return projects;
};

const createProject = async (projectData: Pick<Project, 'title' | 'description' | 'authorId'>): Promise<Project> => {
  return await prisma.project.create({
    data: { ...projectData, users: { connect: { id: projectData.authorId } } },
  });
};

const deleteProject = async ({ projectId, authorId }: DeleteProjectParams): Promise<void> => {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists({ tx, projectId });
    checkUserIsAuthor({ userId: project.authorId, authorId });

    if (project.tasks.length) {
      await tx.task.deleteMany({
        where: { projectId },
      });
    }

    await tx.project.delete({
      where: { id: projectId, authorId },
    });
  });
};

async function userToPoject({ projectId, authorId, addedUserId }: UserToProjectParams): Promise<void> {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists({ tx, projectId });
    checkUserIsAuthor({ userId: project.authorId, authorId });

    await checkUserExists({ tx, userId: addedUserId });
    checkAddedUser({ project, addedUserId });

    await tx.project.update({
      where: { id: projectId },
      data: { users: { connect: { id: addedUserId } } },
    });
  });
}

async function userFromPoject({ projectId, authorId, removedUserId }: UserFromProjectParams): Promise<void> {
  return await prisma.$transaction(async tx => {
    const project = await checkProjectExists({ tx, projectId });
    checkUserIsAuthor({ userId: project.authorId, authorId });

    await checkUserExists({ tx, userId: removedUserId });
    checkRemovedUser({ project, removedUserId });

    await tx.project.update({
      where: { id: projectId },
      data: { users: { disconnect: { id: removedUserId } } },
    });
  });
}

async function projectTime({ projectId, timeFilter }: ProjectTimeParams): Promise<number> {
  const project = await checkProjectExists({ tx: prisma, projectId });

  const totalMs = calculateProjectTime(project.tasks, timeFilter);

  return totalMs;
}

export {
  getProjects,
  projectsByUser,
  projectsForDevTime,
  createProject,
  deleteProject,
  userToPoject,
  userFromPoject,
  projectTime,
};
