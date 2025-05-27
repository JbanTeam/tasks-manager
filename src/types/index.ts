import { Prisma, Task, TaskStatus } from '@prisma/client';

import { projectFullSelect } from '@src/db/selects/project.select';
import { taskSelect } from '@src/db/selects/task.select';
import { userFullSelect } from '@src/db/selects/user.select';

export enum ProjectTimeFilter {
  WEEK = 'week',
  MONTH = 'month',
  HOUR = 'hour',
}

export type UserFullType = Prisma.UserGetPayload<{
  select: typeof userFullSelect;
}>;

export type ProjectFullType = Prisma.ProjectGetPayload<{
  select: typeof projectFullSelect;
}>;

export type TaskType = Prisma.TaskGetPayload<{
  select: typeof taskSelect;
}>;

export type RegisterReturnType = {
  accessToken: string;
  refreshToken: string;
  userId: number;
};

export type ProjectTimeType = {
  days: number;
  hours: number;
  minutes: number;
};

export type TaskUpdateData = {
  status: TaskStatus;
  beginAt?: Date;
  doneAt?: Date;
  spentTime?: number;
};

export type UserToProjectParams = { projectId: number; authorId: number; addedUserId: number };
export type UserFromProjectParams = { projectId: number; authorId: number; removedUserId: number };
export type ProjectTimeParams = { projectId: number; timeFilter?: ProjectTimeFilter };
export type DeleteProjectParams = { projectId: number; authorId: number };

export type CreateTaskData = {
  taskData: Pick<Task, 'title' | 'description' | 'deadline' | 'projectId'>;
  userId: number;
};

export type AssignTaskData = {
  taskId: number;
  userId: number;
  projectId: number;
  performerId: number;
};

export type UpdateTaskStatusData = {
  taskId: number;
  projectId: number;
  userId: number;
  newStatus: TaskStatus;
};

export type DeveloperTimeParams = {
  devId: number;
  timeFilter?: ProjectTimeFilter;
  projectIds?: number[];
};

export type DeveloperTimeReturnType = {
  projectId: number;
  projectName: string;
  timeSpent: ProjectTimeType;
};
