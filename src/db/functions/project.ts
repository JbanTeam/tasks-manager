import { Project } from '@prisma/client';
import prisma from '../prismaClient';

import { timeDifference } from '../../utils';
import { TaskType } from '../../types';
import { checkAddedUser, checkProjectExists } from '../checkExists';
import { ProjectTimeFilter, TaskStatus } from '../../constants';

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

async function projectTime(projectId: number, filterTime?: string) {
  const project = await checkProjectExists(prisma, projectId);

  const totalMs = calculateProjectTime(project.tasks, filterTime);

  return totalMs;
}

const calculateProjectTime = (tasks: TaskType[], filterTime?: string) => {
  const { now, filterDate } = assignFilterDate(filterTime);

  const totalMs = tasks.reduce((acc: number, task: TaskType) => {
    if (!task.beginAt) return acc;
    const taskBeginAt = new Date(task.beginAt);
    const taskDoneAt = task.doneAt ? new Date(task.doneAt) : now;

    if (filterDate) {
      const effectiveStart = taskBeginAt > filterDate ? taskBeginAt : filterDate;

      if (effectiveStart >= taskDoneAt) return acc;

      const { ms } = timeDifference(effectiveStart, taskDoneAt);

      acc += ms;
    } else {
      if (task.status === TaskStatus.IN_PROGRESS) {
        const { ms } = timeDifference(task.beginAt, now);
        acc += ms;
      } else if (task.status === TaskStatus.DONE) {
        acc += Number(task.spentTime);
      }
    }

    return acc;
  }, 0);

  return totalMs;
};

const assignFilterDate = (filterTime?: string) => {
  const now = new Date();
  let filterDate: Date | null = new Date();

  switch (filterTime) {
    case ProjectTimeFilter.WEEK:
      filterDate.setDate(now.getDate() - 7);
      break;
    case ProjectTimeFilter.MONTH:
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case ProjectTimeFilter.HOUR:
      filterDate.setHours(now.getHours() - 24);
      break;
    default:
      filterDate = null;
      break;
  }
  return { now, filterDate };
};

export { getProjects, projectsByUser, createProject, userToPoject, projectTime, calculateProjectTime };
