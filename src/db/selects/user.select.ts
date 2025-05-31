import { projectFullSelect } from './project.select';

export const userLiteSelect = {
  id: true,
  name: true,
  email: true,
  password: true,
  created_at: true,
  refresh_token: true,
};

export const userFullSelect = {
  ...userLiteSelect,
  projects: {
    select: projectFullSelect,
  },
};
