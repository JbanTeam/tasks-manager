import { taskSelect } from './task.select';

export const projectLiteSelect = {
  id: true,
  title: true,
  description: true,
  authorId: true,
  createdAt: true,
};

export const projectWithUsersSelect = {
  ...projectLiteSelect,
  users: {
    select: { id: true },
  },
};

export const projectFullSelect = {
  ...projectWithUsersSelect,

  tasks: {
    select: taskSelect,
  },
};
