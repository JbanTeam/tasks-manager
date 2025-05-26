import { Request, Response, NextFunction } from 'express';

import { UserFullType } from '@src/types';
import HttpError from '@src/errors/HttpError';
import { UserService } from '@src/services/user.service';
import { UserController } from '@src/controllers/user.controller';
import { UserRepository } from '@src/db/repositories/user.repository';
import { GetDevTimeParams, GetDevTimeQuery } from '@src/types/reqTypes';

jest.mock('@src/services/user.service');
jest.mock('@src/db/repositories/user.repository');

const mockUserService = new UserService() as jest.Mocked<UserService>;
const mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;

const mockRequest = {} as Request;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;
const mockNext = jest.fn() as NextFunction;

let userController: UserController;

beforeEach(() => {
  jest.clearAllMocks();
  userController = new UserController();
  // @ts-expect-error: overriding private dependency for unit test
  userController['userRepository'] = mockUserRepository;
  // @ts-expect-error: overriding private dependency for unit test
  userController['userService'] = mockUserService;
});

describe('UserController', () => {
  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, name: 'Vital' }] as UserFullType[];
      mockUserRepository.getUsers = jest.fn().mockResolvedValue(users);

      await userController.getAllUsers(mockRequest, mockResponse, mockNext);

      expect(mockUserRepository.getUsers).toHaveBeenCalled();
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it('should handle error when getting all users', async () => {
      const error = new HttpError({ message: 'GetAllUsers Error' });
      mockUserRepository.getUsers = jest.fn().mockRejectedValue(error);

      await userController.getAllUsers(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('signUp', () => {
    it('should sign up a new user', async () => {
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      mockUserService.registerUser = jest.fn().mockResolvedValue(tokens);
      mockRequest.body = { name: 'Vital', email: 'vital@mail.ru', password: 'password', confirmPassword: 'password' };

      await userController.signUp(mockRequest, mockResponse, mockNext);

      expect(mockUserService.registerUser).toHaveBeenCalledWith(mockRequest.body);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(tokens);
    });

    it('should handle error when signing up', async () => {
      const error = new HttpError({ message: 'SignUp Error' });
      mockUserService.registerUser = jest.fn().mockRejectedValue(error);
      mockRequest.body = { name: 'Vital', email: 'vital@mail.ru', password: 'password', confirmPassword: 'password' };

      await userController.signUp(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      mockUserService.loginUser = jest.fn().mockResolvedValue(tokens);
      mockRequest.body = { email: 'vital@mail.ru', password: 'password' };

      await userController.signIn(mockRequest, mockResponse, mockNext);

      expect(mockUserService.loginUser).toHaveBeenCalledWith(mockRequest.body);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(tokens);
    });

    it('should handle error when signing in', async () => {
      const error = new HttpError({ message: 'SignIn Error' });
      mockUserService.loginUser = jest.fn().mockRejectedValue(error);
      mockRequest.body = { email: 'vital@mail.ru', password: 'password' };

      await userController.signIn(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockUserRepository.updateRefreshToken = jest.fn().mockResolvedValue(undefined);

      await userController.logout(mockRequest, mockResponse, mockNext);

      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith({ userId: 1, refreshToken: null });
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logout successfully' });
    });

    it('should handle logout when user is not found in request', async () => {
      mockRequest.user = undefined;

      await userController.logout(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError({ code: 404, message: 'User not found' }));
    });
  });

  describe('updateAccessToken', () => {
    it('should update access token', async () => {
      const accessToken = 'newAccessToken';
      mockUserService.getNewAccessToken = jest.fn().mockResolvedValue(accessToken);
      mockRequest.body = { refreshToken: 'refresh' };

      await userController.updateAccessToken(mockRequest, mockResponse, mockNext);

      expect(mockUserService.getNewAccessToken).toHaveBeenCalledWith(mockRequest.body);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ accessToken });
    });

    it('should handle error when updating access token', async () => {
      const error = new HttpError({ message: 'Update Access Token Error' });
      mockUserService.getNewAccessToken = jest.fn().mockRejectedValue(error);
      mockRequest.body = { refreshToken: 'refresh' };

      await userController.updateAccessToken(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDeveloperTime', () => {
    it('should get developer time', async () => {
      const projectsTime = [{ projectId: 1, projectName: 'Project', timeSpent: '10h' }];
      mockUserService.getDeveloperTime = jest.fn().mockResolvedValue(projectsTime);
      mockRequest.params = { devId: '1' };
      mockRequest.query = { timeFilter: 'hour', projectIds: '1,2,3' };

      await userController.getDeveloperTime(
        mockRequest as Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>,
        mockResponse,
        mockNext,
      );

      expect(mockUserService.getDeveloperTime).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(projectsTime);
    });

    it('should handle error when getting developer time', async () => {
      const error = new HttpError({ message: 'Get Developer Time Error' });
      mockUserService.getDeveloperTime = jest.fn().mockRejectedValue(error);
      mockRequest.params = { devId: '1' };
      mockRequest.query = { timeFilter: 'hour', projectIds: '1,2,3' };

      await userController.getDeveloperTime(
        mockRequest as Request<GetDevTimeParams, unknown, unknown, GetDevTimeQuery>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUser', () => {
    it('should get a user by ID', async () => {
      const user = {
        id: 1,
        name: 'Vital',
        email: 'vital@mail.ru',
        password: 'hashedPassword',
        refreshToken: null,
        projects: [],
      };
      mockUserRepository.findUserById = jest.fn().mockResolvedValue(user);
      mockRequest.params = { userId: '1' };

      await userController.getUser(mockRequest, mockResponse, mockNext);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(1);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 if user not found for getUser', async () => {
      mockUserRepository.findUserById = jest.fn().mockResolvedValue(null);
      mockRequest.params = { userId: '1' };

      await userController.getUser(mockRequest, mockResponse, mockNext);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalledWith(new HttpError({ code: 404, message: 'User not found' }));
    });

    it('should handle error when getting user', async () => {
      const error = new HttpError({ message: 'GetUser Error' });
      mockUserRepository.findUserById = jest.fn().mockRejectedValue(error);
      mockRequest.params = { userId: '1' };

      await userController.getUser(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
