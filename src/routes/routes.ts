import { Router } from 'express';

import { getAllUsers, signUp, getUser, signIn } from '../controllers/userController';
import { getAllProjects, initProject } from '../controllers/projectController';
import { assignTaskToUser, initTask } from '../controllers/taskController';

const routes = (router: Router) => {
  router.get('/api/users', getAllUsers);
  router.get('/api/users/:userId', getUser);
  router.post('/api/signup', signUp);
  router.post('/api/signin', signIn);

  router.get('/api/projects', getAllProjects);
  router.post('/api/users/:userId/projects', initProject);

  router.post('/api/projects/:projectId/tasks', initTask);
  router.put('/api/projects/:projectId/tasks/:taskId', assignTaskToUser);

  return router;
};

export default routes;
