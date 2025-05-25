import { Router } from 'express';

import authMiddleware from '../middlewares/auth';
import { assignTaskToUser, changeTaskStatus, addTaskToProject, deleteTaskFromDb } from '../controllers/taskController';
import {
  getAllUsers,
  signUp,
  getUser,
  signIn,
  getDeveloperTime,
  logout,
  updateAccessToken,
} from '../controllers/userController';
import {
  addUserToProject,
  deleteProjectFromDb,
  getAllProjects,
  getProjectsByUser,
  getProjectTime,
  initProject,
  removeUserFromProject,
} from '../controllers/projectController';
import { catchAsync } from '@src/utils/catchAsync';

const routes = (router: Router) => {
  router.post('/signup', catchAsync(signUp));
  router.post('/signin', catchAsync(signIn));
  router.patch('/logout', authMiddleware, catchAsync(logout));
  router.post('/update-access', catchAsync(updateAccessToken));
  router.get('/users', catchAsync(getAllUsers));
  router.get('/users/:userId', catchAsync(getUser));
  router.get('/users/:devId/time', authMiddleware, catchAsync(getDeveloperTime));

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
