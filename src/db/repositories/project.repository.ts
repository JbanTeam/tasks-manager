import { Project } from '@prisma/client';

import prisma from '../prismaClient';
import { ProjectType } from '@src/types';
import {
  DeleteProjectParams,
  DeveloperTimeParams,
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

export class ProjectRepository {
  getProject = async (projectId: number): Promise<ProjectType> => {
    const project = await checkProjectExists({ tx: prisma, projectId });

    return project;
  };
  getProjects = async () => {
    return await prisma.project.findMany({ include: { tasks: true, users: { select: { id: true } } } });
  };

  projectsByUser = async (userId: number) => {
    return await prisma.project.findMany({
      where: { users: { some: { id: { equals: userId } } } },
      include: { tasks: { select: { status: true, performerId: true, performer: { select: { name: true } } } } },
    });
  };

  projectsForDevTime = async ({ devId, projectIds }: DeveloperTimeParams) => {
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

  createProject = async (projectData: Pick<Project, 'title' | 'description' | 'authorId'>): Promise<Project> => {
    return await prisma.project.create({
      data: { ...projectData, users: { connect: { id: projectData.authorId } } },
    });
  };

  deleteProject = async ({ projectId, authorId }: DeleteProjectParams): Promise<void> => {
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

  addUserToPoject = async ({ projectId, authorId, addedUserId }: UserToProjectParams): Promise<void> => {
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
  };

  removeUserFromPoject = async ({ projectId, authorId, removedUserId }: UserFromProjectParams): Promise<void> => {
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
  };
}
