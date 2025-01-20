import { Router } from 'express';

const routes = (router: Router) => {
  router.get('/api/start', (req, res) => {
    return res.json({ status: 'success' });
  });

  return router;
};

export default routes;
