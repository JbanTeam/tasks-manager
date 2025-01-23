import 'express';
import { DecodedUser } from '../../src/types';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export {};
