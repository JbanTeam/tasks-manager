import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';

import HttpError from '../errors/HttpError';
import { generateAccessToken, generateTokens, verifyRefreshToken } from '@src/services/userService';
import { registrationSchema, loginSchema } from '../utils/validation';
import {
  DecodedUser,
  GetDevTimeParams,
  GetDevTimeQuery,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
} from '@src/types/reqTypes';
import { getUsers, createUser, userByEmail, userById, developerTime, updateRefreshToken } from '../db/functions/user';

const getAllUsers = async (_req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
};

const signUp = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const { error } = registrationSchema.validate(req.body);
    if (error) throw error;

    const existingUser = await userByEmail(email);

    if (existingUser) throw new HttpError({ code: 400, message: 'User already exists.' });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ name, email, password: hashedPassword });

    const tokens = generateTokens(newUser);
    await updateRefreshToken({ userId: newUser.id, refreshToken: tokens.refreshToken });

    res.status(201).json({ ...tokens });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req: Request<unknown, unknown, LoginBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error) throw error;

    const user = await userByEmail(email);

    if (!user) throw new HttpError({ code: 401, message: 'Invalid credentials.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new HttpError({ code: 401, message: 'Invalid credentials.' });

    const tokens = generateTokens(user);
    await updateRefreshToken({ userId: user.id, refreshToken: tokens.refreshToken });

    res.status(200).json({ ...tokens });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user } = req;

    if (!user) throw new HttpError({ code: 404, message: 'User not found' });

    await updateRefreshToken({ userId: user.userId, refreshToken: null });

    res.status(200).json({ message: 'Logout successfully' });
  } catch (error) {
    next(error);
  }
};

const updateAccessToken = async (
  req: Request<unknown, unknown, RefreshTokenBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const { userId }: DecodedUser = verifyRefreshToken(refreshToken);

    const user = await userById(userId);
    if (!user) throw new HttpError({ code: 404, message: 'User not found' });

    if (user.refreshToken !== refreshToken) {
      throw new HttpError({ code: 401, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const getDeveloperTime = async (
  req: Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { devId } = req.params;
    const { timeFilter, projectIds } = req.query;
    const ids = projectIds !== undefined ? projectIds.toString().split(',').map(Number) : [];

    const projectsTime = await developerTime({ devId: Number(devId), timeFilter: String(timeFilter), projectIds: ids });
    res.status(200).json(projectsTime);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await userById(Number(userId));
    if (!user) throw new HttpError({ code: 404, message: 'User not found. Please provide a valid user ID.' });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export { getAllUsers, signUp, signIn, logout, getUser, updateAccessToken, getDeveloperTime };
