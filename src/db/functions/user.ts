import { User } from '@prisma/client';
import prisma from '../prismaClient';

import { calculateProjectTime } from '../../services/projectService';
import { formatMilliseconds } from '../../utils/time';

type DeveloperTimeParams = {
  devId: number;
  timeFilter?: string;
  projectIds?: number[];
};

const getUsers = async () => {
  return await prisma.user.findMany({ include: { projects: true } });
};

const createUser = async (userData: Pick<User, 'name' | 'email' | 'password'>) => {
  return await prisma.user.create({
    data: userData,
  });
};

const userByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const userById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

const developerTime = async ({ devId, timeFilter, projectIds }: DeveloperTimeParams) => {
  let projects;
  const tasksSelect = {
    iniciatorId: true,
    performerId: true,
    beginAt: true,
    doneAt: true,
    spentTime: true,
    status: true,
  };

  if (projectIds?.length) {
    projects = await prisma.project.findMany({
      where: { id: { in: projectIds }, users: { some: { id: devId } } },
      include: {
        tasks: {
          where: { performerId: devId },
          select: tasksSelect,
        },
      },
    });
  } else {
    projects = await prisma.project.findMany({
      where: { users: { some: { id: devId } } },
      include: {
        tasks: {
          where: { performerId: devId },
          select: tasksSelect,
        },
      },
    });
  }

  const mappedProjects = projects.map(project => {
    const projectMsTime = calculateProjectTime(project.tasks, timeFilter);
    return {
      projectId: project.id,
      projectName: project.title,
      timeSpent: formatMilliseconds(projectMsTime),
    };
  });
  return mappedProjects;
};

export { getUsers, createUser, userByEmail, userById, developerTime };
