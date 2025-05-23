import { User } from '@prisma/client';

import prisma from '../prismaClient';
import { ProjectType } from '@src/types';
import { formatMilliseconds } from '@src/utils/time';
import { DeveloperTimeParams, DeveloperTimeReturnType } from '@src/types/dbTypes';
import { calculateProjectTime } from '@src/services/projectService';

const getUsers = async () => {
  return await prisma.user.findMany({
    include: {
      projects: {
        select: {
          id: true,
          title: true,
          authorId: true,
          users: { select: { id: true } },
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
        },
      },
    },
  });
};

const createUser = async (userData: Pick<User, 'name' | 'email' | 'password'>): Promise<User> => {
  return await prisma.user.create({
    data: userData,
  });
};

const userByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const userById = async (id: number): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

const developerTime = async ({
  devId,
  timeFilter,
  projectIds,
}: DeveloperTimeParams): Promise<DeveloperTimeReturnType[]> => {
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
