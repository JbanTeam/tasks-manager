import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../constants';
import { DecodedUser } from '../types';
import HttpError from '../errors/HttpError';

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    const decodedUser = jwt.verify(token, JWT_SECRET) as DecodedUser;

    if (typeof decodedUser !== 'object' || !('userId' in decodedUser)) {
      throw new HttpError({ code: 401, message: 'Unauthorized.' });
    }

    req.user = decodedUser;

    return next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
