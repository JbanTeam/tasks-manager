import { projectFullSelect } from './project.select';

export const userLiteSelect = {
  id: true,
  name: true,
  email: true,
  password: true,
  createdAt: true,
  refreshToken: true,
};

export const userFullSelect = {
  ...userLiteSelect,
  projects: {
    select: projectFullSelect,
  },
};
