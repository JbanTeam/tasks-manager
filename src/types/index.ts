import { Prisma, TaskStatus } from '@prisma/client';

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type GetDevTimeQuery = {
  timeFilter: string;
  projectIds: string;
};

export type GetDevTimeParams = {
  devId: string;
};

export type AddTaskBody = {
  title: string;
  description: string;
  deadline: Date;
};

export type AddTaskParams = {
  projectId: string;
};

export type AssignTaskBody = {
  performerId: number;
};

export type AssignTaskParams = {
  projectId: string;
  taskId: string;
};

export type ChangeTaskStatusParams = {
  projectId: string;
  taskId: string;
};

export type ChangeTaskStatusBody = {
  status: TaskStatus;
};

export type InitProjectBody = {
  title: string;
  description: string;
};

export type AddUserToProjectBody = {
  addedUserId: number;
};

export type AddUserToProjectParams = {
  projectId: string;
};

export type RemoveUserFromProjectBody = {
  removedUserId: number;
};

export type RemoveUserFromProjectParams = {
  projectId: string;
};

export type DecodedUser = {
  userId: number;
  email: string;
};

export type ProjectType = Prisma.ProjectGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    authorId: true;
    tasks: {
      select: {
        id: true;
        iniciatorId: true;
        performerId: true;
        beginAt: true;
        doneAt: true;
        spentTime: true;
        status: true;
      };
    };
    users: { select: { id: true } };
  };
}>;

export type TaskType = Prisma.TaskGetPayload<{
  select: { iniciatorId: true; performerId: true; beginAt: true; doneAt: true; spentTime: true; status: true };
}>;

export type TaskUpdateData = {
  status: TaskStatus;
  beginAt?: Date;
  doneAt?: Date;
  spentTime?: number;
};
