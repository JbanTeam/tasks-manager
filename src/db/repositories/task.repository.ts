import { Task } from '@prisma/client';

import prisma from '../prismaClient';
import { AssignTaskData, CreateTaskData, UpdateTaskStatusData } from '@src/types';
import {
  checkProjectExists,
  checkTaskExists,
  checkTaskStatus,
  checkUserExists,
  checkUserIsInitiator,
  checkUserIsPerformer,
  checkUserMembership,
} from '../checkExists';

export class TaskRepository {
  createTask = async ({ taskData, userId }: CreateTaskData): Promise<Task> => {
    return await prisma.$transaction(async tx => {
      const project = await checkProjectExists({ tx, projectId: taskData.project_id });
      checkUserMembership({ project, userId });

      return await tx.task.create({
        data: { ...taskData, iniciator_id: userId },
      });
    });
  };

  assignTask = async ({ taskId, userId, projectId, performerId }: AssignTaskData): Promise<Task> => {
    return await prisma.$transaction(async tx => {
      await checkUserExists({ tx, userId: performerId });

      const project = await checkProjectExists({ tx, projectId });
      checkUserMembership({ project, userId });
      checkUserMembership({ project, userId: performerId });

      const task = checkTaskExists({ project, taskId });
      checkUserIsInitiator({ iniciatorId: task.iniciator_id, userId });

      return await tx.task.update({
        where: { id: taskId },
        data: { performer_id: performerId },
      });
    });
  };

  updateTaskStatus = async ({ taskId, projectId, userId, newStatus }: UpdateTaskStatusData): Promise<Task> => {
    return await prisma.$transaction(async tx => {
      const project = await checkProjectExists({ tx, projectId });
      checkUserMembership({ project, userId });

      const task = checkTaskExists({ project, taskId });
      checkUserIsPerformer({ performerId: task.performer_id, userId });

      const taskData = checkTaskStatus({ task, newStatus });

      return await tx.task.update({
        where: { id: taskId },
        data: taskData,
      });
    });
  };

  deleteTask = async ({ taskId, projectId, userId }: Omit<UpdateTaskStatusData, 'newStatus'>): Promise<Task> => {
    return await prisma.$transaction(async tx => {
      const project = await checkProjectExists({ tx, projectId });
      checkUserMembership({ project, userId });

      const task = checkTaskExists({ project, taskId });
      checkUserIsInitiator({ iniciatorId: task.iniciator_id, userId });

      return await tx.task.delete({
        where: { id: taskId },
      });
    });
  };
}
