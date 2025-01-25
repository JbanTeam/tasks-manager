import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../constants';
import { DecodedUser } from '../types';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ errorMessage: 'Unauthorized.' });
    }

    const decodedUser = jwt.verify(token, JWT_SECRET) as DecodedUser;

    if (typeof decodedUser !== 'object' || !('userId' in decodedUser)) {
      return res.status(401).json({ errorMessage: 'Unauthorized.' });
    }

    req.user = decodedUser;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ errorMessage: 'Token expired.' });
    }
    return res.status(403).json({ errorMessage: 'Forbidden. Invalid token.' });
  }
};

export default authMiddleware;
