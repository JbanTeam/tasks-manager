import { Router } from 'express';

import authMiddleware from '../middlewares/auth';
import { catchAsync } from '@src/utils/catchAsync';
import { UserController } from '../controllers/user.controller';
import { ProjectController } from '@src/controllers/project.controller';
import { TaskController } from '../controllers/task.controller';

const userController = new UserController();
const projectController = new ProjectController();
const taskController = new TaskController();

const routes = (router: Router) => {
  router.post('/signup', catchAsync(userController.signUp));
  router.post('/signin', catchAsync(userController.signIn));
  router.patch('/logout', authMiddleware, catchAsync(userController.logout));
  router.post('/update-access', catchAsync(userController.updateAccessToken));
  router.get('/users', catchAsync(userController.getAllUsers));
  router.get('/users/:userId', catchAsync(userController.getUser));
  router.get('/users/:devId/time', authMiddleware, catchAsync(userController.getDeveloperTime));

  router.get('/projects', catchAsync(projectController.getAllProjects));
  router.get('/projects/own', authMiddleware, catchAsync(projectController.getProjectsByUser));
  router.get('/projects/:projectId', authMiddleware, catchAsync(projectController.getProjectsByUser));
  router.get('/projects/:projectId/time', authMiddleware, catchAsync(projectController.getProjectTime));
  router.post('/projects', authMiddleware, catchAsync(projectController.initProject));
  router.patch('/projects/:projectId/add-user', authMiddleware, catchAsync(projectController.addUserToProject));
  router.patch('/projects/:projectId/remove-user', authMiddleware, catchAsync(projectController.removeUserFromProject));
  router.delete('/projects/:projectId', authMiddleware, catchAsync(projectController.deleteProject));

  router.post('/projects/:projectId/tasks', authMiddleware, catchAsync(taskController.addTaskToProject));
  router.patch(
    '/projects/:projectId/tasks/:taskId/assign',
    authMiddleware,
    catchAsync(taskController.assignTaskToUser),
  );
  router.patch(
    '/projects/:projectId/tasks/:taskId/status',
    authMiddleware,
    catchAsync(taskController.changeTaskStatus),
  );
  router.delete('/projects/:projectId/tasks/:taskId', authMiddleware, catchAsync(taskController.deleteTask));

  return router;
};

export default routes;
