import { Router } from 'express';

import { getAllUsers, signUp, getUser, signIn } from '../controllers/userController';
import { getAllProjects, initProject } from '../controllers/projectController';
import { assignTaskToUser, initTask } from '../controllers/taskController';
import { authMiddleware } from '../middlewares';

const routes = (router: Router) => {
  router.get('/users', getAllUsers);
  router.get('/users/:userId', getUser);
  router.post('/signup', signUp);
  router.post('/signin', signIn);

  router.get('/projects', getAllProjects);
  router.post('/users/:userId/projects', authMiddleware, initProject);

  router.post('/projects/:projectId/tasks', authMiddleware, initTask);
  router.put('/projects/:projectId/tasks/:taskId', authMiddleware, assignTaskToUser);

  return router;
};

export default routes;
