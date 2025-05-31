import { Request } from 'express';
import { Task, TaskStatus } from '@prisma/client';

import { TaskService, TaskRepository } from '@src/.';
import {
  AddTaskBody,
  AddTaskParams,
  AssignTaskBody,
  AssignTaskParams,
  ChangeTaskStatusBody,
  ChangeTaskStatusParams,
  DeleteTaskParams,
} from '@src/types/reqTypes';

jest.mock('@src/db/repositories/task.repository');

const mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;

const mockTask = { id: 1, title: 'Task', description: 'Description' } as Task;

describe('TaskService', () => {
  let taskService: TaskService;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    jest.clearAllMocks();
    taskService = new TaskService();
    // @ts-expect-error: overriding private dependency for unit test
    taskService['taskRepository'] = mockTaskRepository;
    mockRequest = {
      user: { userId: 1, email: 'test@example.com' },
    };
  });

  describe('addTaskToProject', () => {
    const addTaskParams: AddTaskParams = { projectId: '1' };
    const addTaskBody: AddTaskBody = { title: 'New Task', description: 'Task Description', deadline: new Date() };

    it('should add a task to a project', async () => {
      mockTaskRepository.createTask = jest.fn().mockResolvedValue(mockTask);
      const req = { ...mockRequest, params: addTaskParams, body: addTaskBody } as Request<
        AddTaskParams,
        unknown,
        AddTaskBody
      >;

      await taskService.addTaskToProject(req);

      expect(mockTaskRepository.createTask).toHaveBeenCalledWith({
        taskData: { ...addTaskBody, project_id: Number(addTaskParams.projectId) },
        userId: mockRequest.user!.userId,
      });
    });

    it('should throw validation error if body is invalid', async () => {
      const invalidBody = { ...addTaskBody, title: '' };
      const req = { ...mockRequest, params: addTaskParams, body: invalidBody } as Request<
        AddTaskParams,
        unknown,
        AddTaskBody
      >;
      await expect(taskService.addTaskToProject(req)).rejects.toThrow();
    });
  });

  describe('assignTaskToUser', () => {
    const assignTaskParams: AssignTaskParams = { projectId: '1', taskId: '1' };
    const assignTaskBody: AssignTaskBody = { performerId: 2 };

    it('should assign a task to a user', async () => {
      mockTaskRepository.assignTask = jest.fn().mockResolvedValue(undefined);
      const req = { ...mockRequest, params: assignTaskParams, body: assignTaskBody } as Request<
        AssignTaskParams,
        unknown,
        AssignTaskBody
      >;

      await taskService.assignTaskToUser(req);

      expect(mockTaskRepository.assignTask).toHaveBeenCalledWith({
        taskId: Number(assignTaskParams.taskId),
        userId: mockRequest.user!.userId,
        projectId: Number(assignTaskParams.projectId),
        performerId: assignTaskBody.performerId,
      });
    });

    it('should throw validation error if params/body are invalid', async () => {
      const invalidParams = { ...assignTaskParams, taskId: '' };
      const req = { ...mockRequest, params: invalidParams, body: assignTaskBody } as Request<
        AssignTaskParams,
        unknown,
        AssignTaskBody
      >;
      await expect(taskService.assignTaskToUser(req)).rejects.toThrow();
    });
  });

  describe('changeTaskStatus', () => {
    const changeTaskStatusParams: ChangeTaskStatusParams = { projectId: '1', taskId: '1' };
    const changeTaskStatusBody: ChangeTaskStatusBody = { status: TaskStatus.IN_PROGRESS };

    it('should change task status', async () => {
      mockTaskRepository.updateTaskStatus = jest.fn().mockResolvedValue(undefined);
      const req = { ...mockRequest, params: changeTaskStatusParams, body: changeTaskStatusBody } as Request<
        ChangeTaskStatusParams,
        unknown,
        ChangeTaskStatusBody
      >;

      await taskService.changeTaskStatus(req);

      expect(mockTaskRepository.updateTaskStatus).toHaveBeenCalledWith({
        taskId: Number(changeTaskStatusParams.taskId),
        projectId: Number(changeTaskStatusParams.projectId),
        userId: mockRequest.user!.userId,
        newStatus: changeTaskStatusBody.status,
      });
    });

    it('should throw validation error if params/body are invalid', async () => {
      const invalidBody = { ...changeTaskStatusBody, status: 'INVALID_STATUS' as TaskStatus };
      const req = { ...mockRequest, params: changeTaskStatusParams, body: invalidBody } as Request<
        ChangeTaskStatusParams,
        unknown,
        ChangeTaskStatusBody
      >;
      await expect(taskService.changeTaskStatus(req)).rejects.toThrow();
    });
  });

  describe('deleteTask', () => {
    const deleteTaskParams: DeleteTaskParams = { projectId: '1', taskId: '1' };

    it('should delete a task', async () => {
      mockTaskRepository.deleteTask = jest.fn().mockResolvedValue(undefined);
      const req = { ...mockRequest, params: deleteTaskParams } as Request<DeleteTaskParams>;

      await taskService.deleteTask(req);

      expect(mockTaskRepository.deleteTask).toHaveBeenCalledWith({
        taskId: Number(deleteTaskParams.taskId),
        projectId: Number(deleteTaskParams.projectId),
        userId: mockRequest.user!.userId,
      });
    });

    it('should throw validation error if params are invalid', async () => {
      const invalidParams = { ...deleteTaskParams, taskId: '' };
      const req = { ...mockRequest, params: invalidParams } as Request<DeleteTaskParams>;
      await expect(taskService.deleteTask(req)).rejects.toThrow();
    });
  });
});
