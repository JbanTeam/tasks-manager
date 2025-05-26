import { Request, Response, NextFunction } from 'express';

import HttpError from '@src/errors/HttpError';
import { TaskService } from '@src/services/task.service';
import { TaskController } from '@src/controllers/task.controller';
import {
  AddTaskParams,
  AddTaskBody,
  AssignTaskParams,
  AssignTaskBody,
  ChangeTaskStatusParams,
  ChangeTaskStatusBody,
  DeleteTaskParams,
} from '@src/types/reqTypes';

jest.mock('../../services/task.service');
jest.mock('../../db/repositories/task.repository');

const mockTaskService = new TaskService() as jest.Mocked<TaskService>;

const mockRequest = {} as Request;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;
const mockNext = jest.fn() as NextFunction;

let taskController: TaskController;

beforeEach(() => {
  jest.clearAllMocks();
  taskController = new TaskController();
  // @ts-expect-error: overriding private dependency for unit test
  taskController['taskService'] = mockTaskService;
});

describe('TaskController', () => {
  describe('addTaskToProject', () => {
    it('should add a task to a project and return 201', async () => {
      mockRequest.params = { projectId: '1' };
      mockRequest.body = { title: 'New Task', description: 'Task Description', deadline: new Date() };
      mockTaskService.addTaskToProject = jest.fn().mockResolvedValue(undefined);

      await taskController.addTaskToProject(
        mockRequest as Request<AddTaskParams, unknown, AddTaskBody>,
        mockResponse,
        mockNext,
      );

      expect(mockTaskService.addTaskToProject).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Task created successfully.' });
    });

    it('should handle errors when adding a task', async () => {
      const error = new HttpError({ message: 'Failed to add task' });
      mockRequest.params = { projectId: '1' };
      mockRequest.body = { title: 'New Task', description: 'Task Description', deadline: new Date() };
      mockTaskService.addTaskToProject = jest.fn().mockRejectedValue(error);

      await taskController.addTaskToProject(
        mockRequest as Request<AddTaskParams, unknown, AddTaskBody>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('assignTaskToUser', () => {
    it('should assign a task to a user and return 200', async () => {
      mockRequest.params = { projectId: '1', taskId: '1' };
      mockRequest.body = { performerId: 2 };
      mockTaskService.assignTaskToUser = jest.fn().mockResolvedValue(undefined);

      await taskController.assignTaskToUser(
        mockRequest as Request<AssignTaskParams, unknown, AssignTaskBody>,
        mockResponse,
        mockNext,
      );

      expect(mockTaskService.assignTaskToUser).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Performer assigned successfully.' });
    });

    it('should handle errors when assigning a task', async () => {
      const error = new HttpError({ message: 'Failed to assign task' });
      mockRequest.params = { projectId: '1', taskId: '1' };
      mockRequest.body = { performerId: 2 };
      mockTaskService.assignTaskToUser = jest.fn().mockRejectedValue(error);

      await taskController.assignTaskToUser(
        mockRequest as Request<AssignTaskParams, unknown, AssignTaskBody>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('changeTaskStatus', () => {
    it('should change task status and return 200', async () => {
      mockRequest.params = { projectId: '1', taskId: '1' };
      mockRequest.body = { status: 'IN_PROGRESS' };
      mockTaskService.changeTaskStatus = jest.fn().mockResolvedValue(undefined);

      await taskController.changeTaskStatus(
        mockRequest as Request<ChangeTaskStatusParams, unknown, ChangeTaskStatusBody>,
        mockResponse,
        mockNext,
      );

      expect(mockTaskService.changeTaskStatus).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Task status changed successfully.' });
    });

    it('should handle errors when changing task status', async () => {
      const error = new HttpError({ message: 'Failed to change task status' });
      mockRequest.params = { projectId: '1', taskId: '1' };
      mockRequest.body = { status: 'IN_PROGRESS' };
      mockTaskService.changeTaskStatus = jest.fn().mockRejectedValue(error);

      await taskController.changeTaskStatus(
        mockRequest as Request<ChangeTaskStatusParams, unknown, ChangeTaskStatusBody>,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and return 200', async () => {
      mockRequest.params = { projectId: '1', taskId: '1' };
      mockTaskService.deleteTask = jest.fn().mockResolvedValue(undefined);

      await taskController.deleteTask(mockRequest as Request<DeleteTaskParams>, mockResponse, mockNext);

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(mockRequest);
      expect(jest.spyOn(mockResponse, 'status')).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Task deleted successfully.' });
    });

    it('should handle errors when deleting a task', async () => {
      const error = new HttpError({ message: 'Failed to delete task' });
      mockRequest.params = { projectId: '1', taskId: '1' };
      mockTaskService.deleteTask = jest.fn().mockRejectedValue(error);

      await taskController.deleteTask(mockRequest as Request<DeleteTaskParams>, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
