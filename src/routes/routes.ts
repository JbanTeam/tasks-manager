import { Router } from 'express';

import { getAllUsers, signUp, getUser, signIn } from '../controllers/userController';
import { addUserToProject, getAllProjects, initProject } from '../controllers/projectController';
import { assignTaskToUser, changeTaskStatus, addTaskToProject } from '../controllers/taskController';
import authMiddleware from '../middlewares/auth';

const routes = (router: Router) => {
  router.get('/users', getAllUsers);
  router.get('/users/:userId', getUser);
  router.post('/signup', signUp);
  router.post('/signin', signIn);

  router.get('/projects', getAllProjects);
  router.post('/projects', authMiddleware, initProject);
  router.put('/projects/:projectId', authMiddleware, addUserToProject);

  router.post('/projects/:projectId/tasks', authMiddleware, addTaskToProject);
  router.put('/projects/:projectId/tasks/:taskId/assign', authMiddleware, assignTaskToUser);
  router.put('/projects/:projectId/tasks/:taskId/status', authMiddleware, changeTaskStatus);

  return router;
};

export default routes;
