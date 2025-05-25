import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

import HttpError from '@src/errors/HttpError';
import { ProjectTimeFilter } from '@src/types';
import { ProjectService } from './project.service';
import { formatMilliseconds } from '@src/utils/time';
import { DeveloperTimeReturnType } from '@src/types/dbTypes';
import { UserRepository } from '@src/db/repositories/user.repository';
import { ProjectRepository } from '@src/db/repositories/project.repository';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '@src/constants';
import {
  DecodedUser,
  GetDevTimeParams,
  GetDevTimeQuery,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
} from '@src/types/reqTypes';
import { getDeveloperTimeSchema, loginSchema, registrationSchema, updateAccessSchema } from '@src/utils/validation';

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly projectService: ProjectService;
  private readonly projectRepository: ProjectRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.projectService = new ProjectService();
    this.projectRepository = new ProjectRepository();
  }

  registerUser = async (body: RegisterBody): Promise<{ accessToken: string; refreshToken: string }> => {
    const { name, email, password } = body;
    const { error } = registrationSchema.validate(body);
    if (error) throw error;

    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new HttpError({ code: 400, message: 'User already exists.' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await this.userRepository.createUser({ name, email, password: hashedPassword });
    const tokens = this.generateTokens(newUser.id, newUser.email);
    await this.userRepository.updateRefreshToken({ userId: newUser.id, refreshToken: tokens.refreshToken });
    return tokens;
  };

  loginUser = async (body: LoginBody): Promise<{ accessToken: string; refreshToken: string }> => {
    const { email, password } = body;
    const { error } = loginSchema.validate(body);
    if (error) throw error;
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpError({ code: 401, message: 'Invalid credentials.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError({ code: 401, message: 'Invalid credentials.' });
    }
    const tokens = this.generateTokens(user.id, user.email);
    await this.userRepository.updateRefreshToken({ userId: user.id, refreshToken: tokens.refreshToken });
    return tokens;
  };

  getNewAccessToken = async (body: RefreshTokenBody): Promise<string> => {
    const { refreshToken } = body;
    const { error } = updateAccessSchema.validate(body);
    if (error) throw error;

    const { userId }: DecodedUser = this.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new HttpError({ code: 404, message: 'User not found' });
    }
    if (user.refreshToken !== refreshToken) {
      throw new HttpError({ code: 401, message: 'Invalid refresh token' });
    }
    return this.generateAccessToken(user.id, user.email);
  };

  getDeveloperTime = async (
    req: Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>,
  ): Promise<DeveloperTimeReturnType[]> => {
    const { devId } = req.params;
    const { timeFilter, projectIds } = req.query;
    const ids = projectIds !== undefined ? projectIds.toString().split(',').map(Number) : [];

    const { error: queryError } = getDeveloperTimeSchema.query.validate(req.query);
    if (queryError) throw queryError;
    const { error: paramsError } = getDeveloperTimeSchema.params.validate(req.params);
    if (paramsError) throw paramsError;

    const projects = await this.projectRepository.projectsForDevTime({
      devId: Number(devId),
      projectIds: ids,
    });

    const mappedProjects = projects.map(project => {
      const projectMsTime = this.projectService.calculateProjectTime(project.tasks, timeFilter as ProjectTimeFilter);
      return {
        projectId: project.id,
        projectName: project.title,
        timeSpent: formatMilliseconds(projectMsTime),
      };
    });
    return mappedProjects;
  };

  private generateTokens = (userId: number, email: string): { accessToken: string; refreshToken: string } => {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = jwt.sign({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  };

  private generateAccessToken = (userId: number, email: string): string => {
    const accessToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
    return accessToken;
  };

  private verifyRefreshToken = (refreshToken: string): DecodedUser => {
    const decodedUser: DecodedUser = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as DecodedUser;
    return decodedUser;
  };
}
