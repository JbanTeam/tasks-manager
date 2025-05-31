import { taskSelect } from './task.select';

export const projectLiteSelect = {
  id: true,
  title: true,
  description: true,
  author_id: true,
  created_at: true,
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
