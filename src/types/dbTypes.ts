import { Task, TaskStatus } from '@prisma/client';

import { ProjectTimeFilter } from '.';

type UserToProjectParams = { projectId: number; authorId: number; addedUserId: number };
type UserFromProjectParams = { projectId: number; authorId: number; removedUserId: number };
type ProjectTimeParams = { projectId: number; timeFilter?: ProjectTimeFilter };
type DeleteProjectParams = { projectId: number; authorId: number };

type CreateTaskData = {
  taskData: Pick<Task, 'title' | 'description' | 'deadline' | 'projectId'>;
  userId: number;
};

type AssignTaskData = {
  taskId: number;
  userId: number;
  projectId: number;
  performerId: number;
};

type UpdateTaskStatusData = {
  taskId: number;
  projectId: number;
  userId: number;
  newStatus: TaskStatus;
};

type DeveloperTimeParams = {
  devId: number;
  timeFilter?: ProjectTimeFilter;
  projectIds?: number[];
};

type DeveloperTimeReturnType = {
  projectId: number;
  projectName: string;
  timeSpent: {
    days: number;
    hours: number;
    minutes: number;
  };
};

export {
  UserToProjectParams,
  UserFromProjectParams,
  ProjectTimeParams,
  DeleteProjectParams,
  CreateTaskData,
  AssignTaskData,
  UpdateTaskStatusData,
  DeveloperTimeParams,
  DeveloperTimeReturnType,
};
