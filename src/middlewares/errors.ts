import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ValidationError } from 'joi';
import { CustomError } from '../errors/CustomError';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error(JSON.stringify({ code: err.statusCode, errors: err.errors, stack: err.stack }, null, 2));
    }

    return res.status(statusCode).json({ errors });
  } else if (err instanceof jwt.JsonWebTokenError) {
    console.error(JSON.stringify(err, null, 2));
    return res.status(401).json({ errors: [{ message: 'Forbidden. Invalid token.' }] });
  } else if (err instanceof jwt.TokenExpiredError) {
    console.error(JSON.stringify(err, null, 2));
    return res.status(401).json({ errors: [{ message: 'Token expired.' }] });
  } else if (err instanceof ValidationError) {
    const errors = err.details.map(detail => ({ message: detail.message, context: detail.context }));
    console.error(JSON.stringify({ errors }, null, 2));
    return res.status(400).json({ errors });
  }
  console.error(JSON.stringify(err, null, 2));
  return res.status(500).json({ errors: [{ message: 'Something went wrong' }] });
};

export default errorHandler;
