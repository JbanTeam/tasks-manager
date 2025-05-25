import { TaskStatus } from '@prisma/client';
import { ProjectTimeFilter } from '.';

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

export type DeleteTaskParams = {
  projectId: string;
  taskId: string;
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

export type ProjectTimeParams = {
  projectId: string;
};
export type ProjectTimeQuery = {
  timeFilter: ProjectTimeFilter;
};

export type DeleteProjectParams = {
  projectId: string;
};

export type RefreshTokenBody = {
  refreshToken: string;
};

export type DecodedUser = {
  userId: number;
  email: string;
};
