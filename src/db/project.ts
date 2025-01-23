import { Project } from '@prisma/client';
import prisma from './client';

const getProjects = async () => {
  return await prisma.project.findMany({ include: { tasks: true } });
};

const checkUserRightsForProject = async (projectId: number, userId: number) => {
  return await prisma.project.findFirst({
    where: { id: projectId, authorId: userId },
  });
};

const createProject = async (projectData: Pick<Project, 'title' | 'description' | 'authorId'>) => {
  return await prisma.project.create({
    data: projectData,
  });
};

export { getProjects, createProject, checkUserRightsForProject };
