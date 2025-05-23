import 'express';

import { DecodedUser } from '@src/types/reqTypes';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export {};
