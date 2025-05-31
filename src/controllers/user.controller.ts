import { NextFunction, Request, Response } from 'express';

import HttpError from '../errors/HttpError';
import { UserService, UserRepository } from '@src/.';
import { GetDevTimeParams, GetDevTimeQuery, LoginBody, RefreshTokenBody, RegisterBody } from '@src/types/reqTypes';

export class UserController {
  private readonly userService: UserService;
  private readonly userRepository: UserRepository;

  constructor() {
    this.userService = new UserService();
    this.userRepository = new UserRepository();
  }

  getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userRepository.getUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  signUp = async (req: Request<unknown, unknown, RegisterBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.userService.registerUser(req.body);
      res.status(201).json(tokens);
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req: Request<unknown, unknown, LoginBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.userService.loginUser(req.body);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user } = req;
      if (!user) throw new HttpError({ code: 404, message: 'User not found' });
      await this.userRepository.updateRefreshToken({ userId: user.userId, refreshToken: null });
      res.status(200).json({ message: 'Logout successfully' });
    } catch (error) {
      next(error);
    }
  };

  updateAccessToken = async (
    req: Request<unknown, unknown, RefreshTokenBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accessToken = await this.userService.getNewAccessToken(req.body);
      res.status(200).json({ accessToken });
    } catch (error) {
      next(error);
    }
  };

  getDeveloperTime = async (
    req: Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const projectsTime = await this.userService.getDeveloperTime(req);

      res.status(200).json(projectsTime);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await this.userRepository.findUserById(Number(userId));
      if (!user) throw new HttpError({ code: 404, message: 'User not found' });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
