import { Router } from 'express';

import { getAllUsers, signUp, getUser, getUsersCount, signIn } from '../controllers/userController';

const routes = (router: Router) => {
  router.get('/api/users-count', getUsersCount);
  router.get('/api/users', getAllUsers);
  router.get('/api/users/:id', getUser);
  router.post('/api/signup', signUp);
  router.post('/api/signin', signIn);

  return router;
};

export default routes;
