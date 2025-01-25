import { Project } from '@prisma/client';
import prisma from './client';
import HttpError from '../errors/HttpError';

const getProjects = async () => {
  return await prisma.project.findMany({ include: { tasks: true, users: { select: { id: true } } } });
};

const createProject = async (projectData: Pick<Project, 'title' | 'description' | 'authorId'>) => {
  return await prisma.project.create({
    data: { ...projectData, users: { connect: { id: projectData.authorId } } },
  });
};

async function userToPoject(projectId: number, authorId: number, addedUserId: number) {
  return await prisma.$transaction(async tx => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      select: { authorId: true, users: { select: { id: true } } },
    });

    if (!project) {
      throw new HttpError({ code: 404, message: 'Project not found.' });
    }

    if (project.authorId !== authorId) {
      throw new HttpError({ code: 401, message: 'You are not the owner of this project.' });
    }

    if (project.users.some(user => user.id === addedUserId)) {
      throw new HttpError({ code: 400, message: 'User is already in this project.' });
    }

    await tx.project.update({
      where: { id: projectId },
      data: { users: { connect: { id: addedUserId } } },
    });
  });
}

export { getProjects, createProject, userToPoject };
