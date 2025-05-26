import { Request, Response, NextFunction } from 'express';
import { Project } from '@prisma/client';

import HttpError from '@src/errors/HttpError';
import { ProjectService } from '@src/services/project.service';
import { ProjectController } from '@src/controllers/project.controller';
import { ProjectFullType, ProjectTimeType } from '@src/types';
import {
  AddUserToProjectBody,
  AddUserToProjectParams,
  DeleteProjectParams,
  InitProjectBody,
  ProjectTimeParams,
  ProjectTimeQuery,
  RemoveUserFromProjectBody,
  RemoveUserFromProjectParams,
} from '@src/types/reqTypes';

jest.mock('@src/services/project.service');

const mockProjectService = new ProjectService() as jest.Mocked<ProjectService>;

const mockRequest = {} as Request;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;
const mockNext = jest.fn() as NextFunction;

let projectController: ProjectController;

beforeEach(() => {
  jest.clearAllMocks();
  projectController = new ProjectController();
  // @ts-expect-error: overriding private dependency for unit test
  projectController['projectService'] = mockProjectService;
});

describe('ProjectController', () => {
  describe('getAllProjects', () => {
    it('should return all projects and status 200', async () => {
      const projects = [{ id: 1, title: 'Project 1' }] as ProjectFullType[];
      mockProjectService.getAllProjects = jest.fn().mockResolvedValue(projects);

      await projectController.getAllProjects(mockRequest, mockResponse, mockNext);

      expect(mockProjectService.getAllProjects).toHaveBeenCalled();
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(projects);
    });

    it('should handle errors when getting all projects', async () => {
      const error = new HttpError({ message: 'Failed to get projects' });
      mockProjectService.getAllProjects = jest.fn().mockRejectedValue(error);

      await projectController.getAllProjects(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProjectsByUser', () => {
    it('should return projects for a user and status 200', async () => {
      const projects = [{ id: 1, title: 'User Project' }] as ProjectFullType[];
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.getProjectsByUser = jest.fn().mockResolvedValue(projects);

      await projectController.getProjectsByUser(mockRequest, mockResponse, mockNext);

      expect(mockProjectService.getProjectsByUser).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(projects);
    });

    it('should handle errors when getting projects by user', async () => {
      const error = new HttpError({ message: 'Failed to get user projects' });
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.getProjectsByUser = jest.fn().mockRejectedValue(error);

      await projectController.getProjectsByUser(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('initProject', () => {
    it('should initialize a project and return status 201', async () => {
      mockRequest.body = { title: 'New Project', description: 'Project Description' };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      const newProject = { id: 1, ...mockRequest.body, authorId: 1 } as Project;
      mockProjectService.initProject = jest.fn().mockResolvedValue(newProject);

      await projectController.initProject(
        mockRequest as Request<unknown, unknown, InitProjectBody>,
        mockResponse,
        mockNext,
      );

      expect(mockProjectService.initProject).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Project created successfully.' });
    });

    it('should handle errors when initializing a project', async () => {
      const error = new HttpError({ message: 'Failed to init project' });
      mockRequest.body = { title: 'New Project', description: 'Project Description' };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.initProject = jest.fn().mockRejectedValue(error);

      await projectController.initProject(
        mockRequest as Request<unknown, unknown, InitProjectBody>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('addUserToProject', () => {
    it('should add a user to a project and return status 200', async () => {
      mockRequest.params = { projectId: '1' };
      mockRequest.body = { addedUserId: 2 };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' }; // Assuming author
      mockProjectService.addUserToProject = jest.fn().mockResolvedValue(undefined);

      await projectController.addUserToProject(
        mockRequest as Request<AddUserToProjectParams, unknown, AddUserToProjectBody>,
        mockResponse,
        mockNext,
      );

      expect(mockProjectService.addUserToProject).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User added successfully.' });
    });

    it('should handle errors when adding a user to a project', async () => {
      const error = new HttpError({ message: 'Failed to add user' });
      mockRequest.params = { projectId: '1' };
      mockRequest.body = { addedUserId: 2 };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.addUserToProject = jest.fn().mockRejectedValue(error);

      await projectController.addUserToProject(
        mockRequest as Request<AddUserToProjectParams, unknown, AddUserToProjectBody>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('removeUserFromProject', () => {
    it('should remove a user from a project and return status 200', async () => {
      mockRequest.params = { projectId: '1' };
      mockRequest.body = { removedUserId: 2 };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' }; // Assuming author
      mockProjectService.removeUserFromProject = jest.fn().mockResolvedValue(undefined);

      await projectController.removeUserFromProject(
        mockRequest as Request<RemoveUserFromProjectParams, unknown, RemoveUserFromProjectBody>,
        mockResponse,
        mockNext,
      );

      expect(mockProjectService.removeUserFromProject).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User removed successfully.' });
    });

    it('should handle errors when removing a user from a project', async () => {
      const error = new HttpError({ message: 'Failed to remove user' });
      mockRequest.params = { projectId: '1' };
      mockRequest.body = { removedUserId: 2 };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.removeUserFromProject = jest.fn().mockRejectedValue(error);

      await projectController.removeUserFromProject(
        mockRequest as Request<RemoveUserFromProjectParams, unknown, RemoveUserFromProjectBody>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProjectTime', () => {
    it('should return project time and status 200', async () => {
      const projectTime = { days: 1, hours: 2, minutes: 3 } as ProjectTimeType;
      mockRequest.params = { projectId: '1' };
      mockRequest.query = { timeFilter: 'all' };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.getProjectTime = jest.fn().mockResolvedValue(projectTime);

      await projectController.getProjectTime(
        mockRequest as Request<ProjectTimeParams, unknown, unknown, ProjectTimeQuery>,
        mockResponse,
        mockNext,
      );

      expect(mockProjectService.getProjectTime).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(projectTime);
    });

    it('should handle errors when getting project time', async () => {
      const error = new HttpError({ message: 'Failed to get project time' });
      mockRequest.params = { projectId: '1' };
      mockRequest.query = { timeFilter: 'hour' };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.getProjectTime = jest.fn().mockRejectedValue(error);

      await projectController.getProjectTime(
        mockRequest as Request<ProjectTimeParams, unknown, unknown, ProjectTimeQuery>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project and return status 200', async () => {
      mockRequest.params = { projectId: '1' };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.deleteProject = jest.fn().mockResolvedValue(undefined);

      await projectController.deleteProject(mockRequest as Request<DeleteProjectParams>, mockResponse, mockNext);

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Project deleted successfully.' });
    });

    it('should handle errors when deleting a project', async () => {
      const error = new HttpError({ message: 'Failed to delete project' });
      mockRequest.params = { projectId: '1' };
      mockRequest.user = { userId: 1, email: 'vital@mail.ru' };
      mockProjectService.deleteProject = jest.fn().mockRejectedValue(error);

      await projectController.deleteProject(mockRequest as Request<DeleteProjectParams>, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
