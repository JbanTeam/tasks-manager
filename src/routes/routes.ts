import { Router } from 'express';

import authMiddleware from '../middlewares/auth';
import { catchAsync } from '@src/utils/catchAsync';
import { UserController } from '../controllers/user.controller';
import { assignTaskToUser, changeTaskStatus, addTaskToProject, deleteTaskFromDb } from '../controllers/taskController';
import {
  addUserToProject,
  deleteProjectFromDb,
  getAllProjects,
  getProjectsByUser,
  getProjectTime,
  initProject,
  removeUserFromProject,
} from '../controllers/projectController';

const userController = new UserController();

const routes = (router: Router) => {
  router.post('/signup', catchAsync(userController.signUp));
  router.post('/signin', catchAsync(userController.signIn));
  router.patch('/logout', authMiddleware, catchAsync(userController.logout));
  router.post('/update-access', catchAsync(userController.updateAccessToken));
  router.get('/users', catchAsync(userController.getAllUsers));
  router.get('/users/:userId', catchAsync(userController.getUser));
  router.get('/users/:devId/time', authMiddleware, catchAsync(userController.getDeveloperTime));

  router.get('/projects', catchAsync(getAllProjects));
  router.get('/projects/own', authMiddleware, catchAsync(getProjectsByUser));
  router.get('/projects/:projectId', authMiddleware, catchAsync(getProjectsByUser));
  router.get('/projects/:projectId/time', authMiddleware, catchAsync(getProjectTime));
  router.post('/projects', authMiddleware, catchAsync(initProject));
  router.patch('/projects/:projectId/add-user', authMiddleware, catchAsync(addUserToProject));
  router.patch('/projects/:projectId/remove-user', authMiddleware, catchAsync(removeUserFromProject));
  router.delete('/projects/:projectId', authMiddleware, catchAsync(deleteProjectFromDb));

  router.post('/projects/:projectId/tasks', authMiddleware, catchAsync(addTaskToProject));
  router.patch('/projects/:projectId/tasks/:taskId/assign', authMiddleware, catchAsync(assignTaskToUser));
  router.patch('/projects/:projectId/tasks/:taskId/status', authMiddleware, catchAsync(changeTaskStatus));
  router.delete('/projects/:projectId/tasks/:taskId', authMiddleware, catchAsync(deleteTaskFromDb));

  return router;
};

export default routes;
