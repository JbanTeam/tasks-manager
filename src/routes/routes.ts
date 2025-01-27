import { Router } from 'express';

import authMiddleware from '../middlewares/auth';
import {
  addUserToProject,
  getAllProjects,
  getProjectsByUser,
  getProjectTime,
  initProject,
} from '../controllers/projectController';
import { assignTaskToUser, changeTaskStatus, addTaskToProject } from '../controllers/taskController';
import { getAllUsers, signUp, getUser, signIn, getDeveloperTime } from '../controllers/userController';

const routes = (router: Router) => {
  router.post('/signup', signUp);
  router.post('/signin', signIn);
  router.get('/users', getAllUsers);
  router.get('/users/:userId', getUser);
  router.get('/users/:devId/time', authMiddleware, getDeveloperTime);

  router.get('/projects/all', getAllProjects);
  router.get('/projects', authMiddleware, getProjectsByUser);
  router.get('/projects/:projectId', authMiddleware, getProjectsByUser);
  router.get('/projects/:projectId/time', authMiddleware, getProjectTime);
  router.post('/projects', authMiddleware, initProject);
  router.put('/projects/:projectId/add-user', authMiddleware, addUserToProject);

  router.post('/projects/:projectId/tasks', authMiddleware, addTaskToProject);
  router.put('/projects/:projectId/tasks/:taskId/assign', authMiddleware, assignTaskToUser);
  router.put('/projects/:projectId/tasks/:taskId/status', authMiddleware, changeTaskStatus);

  return router;
};

export default routes;
