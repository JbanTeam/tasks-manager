import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

import auth from '../auth';
import HttpError from '@src/errors/HttpError';
import { DecodedUser } from '@src/types/reqTypes';

jest.mock('jsonwebtoken');

interface CustomRequest extends Request {
  user?: DecodedUser;
}

describe('Auth Middleware', () => {
  let req: CustomRequest;
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} } as Request;
    res = {} as Response;
    next = jest.fn();
  });

  it('should throw an error if no authorization token', () => {
    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]._code).toBe(401);
    expect(next.mock.calls[0][0]).toHaveProperty('errors', [{ message: 'Unauthorized.', context: {} }]);
  });

  it('should throw an error if token invalid', () => {
    req.headers.authorization = 'Bearer invalidToken';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new HttpError({ code: 401, message: 'Unauthorized.' });
    });

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]._code).toBe(401);
    expect(next.mock.calls[0][0]).toHaveProperty('errors', [{ message: 'Unauthorized.', context: {} }]);
  });

  it('should decode token and set req.user successfully', () => {
    const mockUser: DecodedUser = { userId: 1, email: 'vital@mail.ru' };
    req.headers.authorization = 'Bearer validToken';
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    auth(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should throw an error if token decoded, but not contains userId', () => {
    req.headers.authorization = 'Bearer valid_token';
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'vital@mail.ru' });

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]._code).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Unauthorized.');
  });
});
