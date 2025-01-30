import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { getUsers, createUser, userByEmail, userById, developerTime } from '../db/functions/user';
import { JWT_SECRET } from '../constants';
import HttpError from '../errors/HttpError';
import { registrationSchema, loginSchema } from '../utils/validation';

const getAllUsers = async (req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
};

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const { error } = registrationSchema.validate(req.body);
    if (error) throw error;

    const existingUser = await userByEmail(email);

    if (existingUser) throw new HttpError({ code: 400, message: 'User already exists.' });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ name, email, password: hashedPassword });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7 days' });

    res.status(201).json({
      userId: newUser.id,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error) throw error;

    const user = await userByEmail(email);

    if (!user) throw new HttpError({ code: 401, message: 'Invalid credentials.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new HttpError({ code: 401, message: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7 days' });

    res.status(200).json({
      userId: user.id,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getDeveloperTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { devId } = req.params;
    const { timeFilter, projectIds } = req.query;
    const ids = projectIds !== undefined ? String(projectIds).split(',').map(Number) : [];

    const projectsTime = await developerTime({ devId: Number(devId), timeFilter: String(timeFilter), projectIds: ids });
    res.status(200).json(projectsTime);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await userById(Number(userId));
    if (!user) throw new HttpError({ code: 404, message: 'User not found. Please provide a valid user ID.' });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export { getAllUsers, signUp, signIn, getUser, getDeveloperTime };
