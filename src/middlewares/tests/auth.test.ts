import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import auth from '../auth';
import { JWT_SECRET } from '../../constants';
import HttpError from '../../errors/HttpError';
import { DecodedUser } from '../../types';

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

  test('Must return 401, if no authorization token', () => {
    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]._code).toBe(401);
    expect(next.mock.calls[0][0]).toHaveProperty('errors', [{ message: 'Unauthorized.', context: {} }]);
  });

  test('Must return 401, if token invalid', () => {
    req.headers.authorization = 'Bearer invalidToken';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new HttpError({ code: 401, message: 'Unauthorized.' });
    });

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]._code).toBe(401);
    expect(next.mock.calls[0][0]).toHaveProperty('errors', [{ message: 'Unauthorized.', context: {} }]);
  });

  test('Must decode token and set req.user successfully', () => {
    const mockUser: DecodedUser = { userId: 1, email: 'vital@mail.ru' };
    req.headers.authorization = 'Bearer validToken';
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    auth(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('Must return 401, if token decoded, but not contains userId', () => {
    req.headers.authorization = 'Bearer valid_token';
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'vital@mail.ru' });

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]._code).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Unauthorized.');
  });
});
