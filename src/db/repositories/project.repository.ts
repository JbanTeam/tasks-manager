import { Project } from '@prisma/client';

import prisma from '../prismaClient';
import { ProjectFullType } from '@src/types';
import { projectFullSelect } from '../selects/project.select';
import { DeleteProjectParams, DeveloperTimeParams, UserFromProjectParams, UserToProjectParams } from '@src/types';
import {
  checkAddedUser,
  checkProjectExists,
  checkRemovedUser,
  checkUserExists,
  checkUserIsAuthor,
} from '../checkExists';

export class ProjectRepository {
  getProject = async (projectId: number): Promise<ProjectFullType> => {
    const project = await checkProjectExists({ tx: prisma, projectId });

    return project;
  };
  getProjects = async (): Promise<ProjectFullType[]> => {
    return await prisma.project.findMany({ select: projectFullSelect });
  };

  projectsByUser = async (userId: number): Promise<ProjectFullType[]> => {
    return await prisma.project.findMany({
      where: { users: { some: { id: { equals: userId } } } },
      select: projectFullSelect,
    });
  };

  projectsForDevTime = async ({ devId, projectIds }: DeveloperTimeParams): Promise<ProjectFullType[]> => {
    let projects: ProjectFullType[];

    if (projectIds?.length) {
      projects = await prisma.project.findMany({
        where: { id: { in: projectIds }, users: { some: { id: devId } } },
        select: projectFullSelect,
      });
    } else {
      projects = await prisma.project.findMany({
        where: { users: { some: { id: devId } } },
        select: projectFullSelect,
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
