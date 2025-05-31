import bcrypt from 'bcrypt';
import { Request } from 'express';
import { User } from '@prisma/client';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import HttpError from '@src/errors/HttpError';
import { ProjectTimeFilter } from '@src/types';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '@src/constants';
import { UserService, UserRepository, ProjectService, ProjectRepository } from '@src/.';
import { GetDevTimeParams, GetDevTimeQuery, LoginBody, RefreshTokenBody, RegisterBody } from '@src/types/reqTypes';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@src/db/repositories/user.repository');
jest.mock('@src/services/project.service');
jest.mock('@src/db/repositories/project.repository');

const mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
const mockProjectService = new ProjectService() as jest.Mocked<ProjectService>;
const mockProjectRepository = new ProjectRepository() as jest.Mocked<ProjectRepository>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

mockUserRepository.findUserByEmail = jest.fn();
mockUserRepository.findUserById = jest.fn();
mockUserRepository.createUser = jest.fn();
mockUserRepository.updateRefreshToken = jest.fn();
mockUserRepository.getUsers = jest.fn();

mockProjectRepository.projectsForDevTime = jest.fn();

mockProjectService.calculateProjectTime = jest.fn();

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
    // @ts-expect-error: overriding private dependency for unit test
    userService['userRepository'] = mockUserRepository;
    // @ts-expect-error: overriding private dependency for unit test
    userService['projectService'] = mockProjectService;
    // @ts-expect-error: overriding private dependency for unit test
    userService['projectRepository'] = mockProjectRepository;
  });

  describe('registerUser', () => {
    const registerBody: RegisterBody = {
      name: 'Vital',
      email: 'vital@mail.ru',
      password: 'password123',
      confirmPassword: 'password123',
    };
    const mockUser = { id: 1, email: 'vital@mail.ru', name: 'Vital' } as User;
    const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

    it('should register a new user and return tokens', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockUserRepository.createUser.mockResolvedValue(mockUser);
      (userService as any).generateTokens = jest.fn().mockReturnValue(mockTokens);
      mockUserRepository.updateRefreshToken.mockResolvedValue(undefined);

      const result = await userService.registerUser(registerBody);

      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(registerBody.email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerBody.password, 10);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        name: registerBody.name,
        email: registerBody.email,
        password: 'hashedPassword',
      });
      expect((userService as any).generateTokens).toHaveBeenCalledWith(mockUser.id, mockUser.email);
      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        refreshToken: mockTokens.refreshToken,
      });
      expect(result).toEqual({ userId: mockUser.id, ...mockTokens });
    });

    it('should throw error if user already exists', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

      await expect(userService.registerUser(registerBody)).rejects.toThrow(HttpError);
      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(registerBody.email);
    });

    it('should throw validation error if body is invalid', async () => {
      const invalidBody = { ...registerBody, email: 'invalid' } as RegisterBody;
      await expect(userService.registerUser(invalidBody)).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    const loginBody: LoginBody = { email: 'vital@mail.ru', password: 'password123' };
    const mockUser = { id: 1, email: 'vital@mail.ru', password: 'hashedPassword' } as User;
    const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

    it('should login a user and return tokens', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      (userService as any).generateTokens = jest.fn().mockReturnValue(mockTokens);
      mockUserRepository.updateRefreshToken.mockResolvedValue(undefined);

      const result = await userService.loginUser(loginBody);

      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(loginBody.email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginBody.password, mockUser.password);
      expect((userService as any).generateTokens).toHaveBeenCalledWith(mockUser.id, mockUser.email);
      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        refreshToken: mockTokens.refreshToken,
      });
      expect(result).toEqual({ userId: mockUser.id, ...mockTokens });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await expect(userService.loginUser(loginBody)).rejects.toThrow(HttpError);
      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(loginBody.email);
    });

    it('should throw error if password is invalid', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(userService.loginUser(loginBody)).rejects.toThrow(HttpError);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginBody.password, mockUser.password);
    });

    it('should throw validation error if body is invalid', async () => {
      const invalidBody = { email: 'invalid' } as LoginBody;
      await expect(userService.loginUser(invalidBody)).rejects.toThrow();
    });
  });

  describe('getNewAccessToken', () => {
    const refreshToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const refreshTokenBody: RefreshTokenBody = { refreshToken };
    const decodedUser = { userId: 1, email: 'vital@mail.ru' };
    const mockUser = { id: 1, email: 'vital@mail.ru', refresh_token: refreshToken } as User;
    const newAccessToken = 'new-access-token';

    it('should return a new access token', async () => {
      (userService as any).verifyRefreshToken = jest.fn().mockReturnValue(decodedUser);
      mockUserRepository.findUserById.mockResolvedValue(mockUser);
      (userService as any).generateAccessToken = jest.fn().mockReturnValue(newAccessToken);

      const result = await userService.getNewAccessToken(refreshTokenBody);

      expect((userService as any).verifyRefreshToken).toHaveBeenCalledWith(refreshTokenBody.refreshToken);
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(decodedUser.userId);
      expect((userService as any).generateAccessToken).toHaveBeenCalledWith(mockUser.id, mockUser.email);
      expect(result).toBe(newAccessToken);
    });

    it('should throw error if user not found', async () => {
      (userService as any).verifyRefreshToken = jest.fn().mockReturnValue(decodedUser);
      mockUserRepository.findUserById.mockResolvedValue(null);

      await expect(userService.getNewAccessToken(refreshTokenBody)).rejects.toThrow(HttpError);
    });

    it('should throw error if refresh token is invalid', async () => {
      (userService as any).verifyRefreshToken = jest.fn().mockReturnValue(decodedUser);
      mockUserRepository.findUserById.mockResolvedValue({ ...mockUser, refresh_token: 'different-token' } as User);

      await expect(userService.getNewAccessToken(refreshTokenBody)).rejects.toThrow(HttpError);
    });

    it('should throw validation error if body is invalid', async () => {
      const invalidBody = {} as RefreshTokenBody;
      await expect(userService.getNewAccessToken(invalidBody)).rejects.toThrow();
    });
  });

  describe('getDeveloperTime', () => {
    const mockReq = {
      params: { devId: '1' },
      query: { timeFilter: ProjectTimeFilter.WEEK, projectIds: '1,2' },
    } as unknown as Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>;
    const mockProjects = [
      { id: 1, title: 'Project 1', tasks: [] },
      { id: 2, title: 'Project 2', tasks: [] },
    ] as any[];
    const mockFormattedTime = [
      { projectId: 1, projectName: 'Project 1', timeSpent: { days: 0, hours: 0, minutes: 0 } },
      { projectId: 2, projectName: 'Project 2', timeSpent: { days: 0, hours: 0, minutes: 0 } },
    ];

    it('should return developer time for projects', async () => {
      mockProjectRepository.projectsForDevTime.mockResolvedValue(mockProjects);
      mockProjectService.calculateProjectTime.mockReturnValue(0);

      const result = await userService.getDeveloperTime(mockReq);

      expect(mockProjectRepository.projectsForDevTime).toHaveBeenCalledWith({ devId: 1, projectIds: [1, 2] });
      expect(mockProjectService.calculateProjectTime).toHaveBeenCalledTimes(mockProjects.length);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockFormattedTime);
    });

    it('should throw validation error for query if invalid', async () => {
      const invalidReq = {
        params: { devId: '1' },
        query: { timeFilter: 'invalid', projectIds: '1,2' },
      } as unknown as Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>;
      await expect(userService.getDeveloperTime(invalidReq)).rejects.toThrow();
    });

    it('should throw validation error for params if invalid', async () => {
      const invalidReq = {
        params: {},
        query: { timeFilter: ProjectTimeFilter.WEEK },
      } as unknown as Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>;
      await expect(userService.getDeveloperTime(invalidReq)).rejects.toThrow();
    });
  });

  describe('Token Generation and Verification', () => {
    const userId = 1;
    const email = 'vital@mail.ru';

    it('generateTokens should create access and refresh tokens', () => {
      mockJwt.sign.mockImplementation((_payload, secret) => {
        if (secret === JWT_SECRET) return 'mockAccessToken';
        if (secret === JWT_REFRESH_SECRET) return 'mockRefreshToken';
        return '';
      });

      const tokens = userService['generateTokens'](userId, email);
      expect(mockJwt.sign).toHaveBeenCalledWith({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
      expect(mockJwt.sign).toHaveBeenCalledWith({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
      expect(tokens).toEqual({ accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' });
    });

    it('generateAccessToken should create an access token', () => {
      mockJwt.sign = jest.fn().mockReturnValue('mockAccessToken');
      const token = userService['generateAccessToken'](userId, email);
      expect(mockJwt.sign).toHaveBeenCalledWith({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
      expect(token).toBe('mockAccessToken');
    });

    it('verifyRefreshToken should decode a refresh token', () => {
      const mockDecodedUser = { userId, email };
      mockJwt.verify.mockReturnValue(mockDecodedUser as any);
      const decoded = userService['verifyRefreshToken']('mockRefreshToken');
      expect(mockJwt.verify).toHaveBeenCalledWith('mockRefreshToken', JWT_REFRESH_SECRET);
      expect(decoded).toEqual(mockDecodedUser);
    });

    it('verifyRefreshToken should throw error for invalid token', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new JsonWebTokenError('Invalid token');
      });
      expect(() => userService['verifyRefreshToken']('invalidToken')).toThrow(JsonWebTokenError);
    });
  });
});
