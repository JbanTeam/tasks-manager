import { Request } from 'express';

import { TaskRepository } from '@src/.';
import { assignTaskSchema, changeTaskStatusSchema, deleteTaskSchema, taskSchema } from '@src/utils/validation';
import {
  AddTaskBody,
  AddTaskParams,
  AssignTaskBody,
  AssignTaskParams,
  ChangeTaskStatusBody,
  ChangeTaskStatusParams,
  DeleteTaskParams,
} from '@src/types/reqTypes';

export class TaskService {
  private readonly taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  addTaskToProject = async (req: Request<AddTaskParams, unknown, AddTaskBody>): Promise<void> => {
    const { user } = req;
    const { projectId } = req.params;
    const { title, description, deadline } = req.body;

    const { error } = taskSchema.validate({ title, description, deadline, projectId });
    if (error) throw error;

    await this.taskRepository.createTask({
      taskData: { title, description, deadline, projectId: Number(projectId) },
      userId: user!.userId,
    });
  };

  assignTaskToUser = async (req: Request<AssignTaskParams, unknown, AssignTaskBody>): Promise<void> => {
    const { taskId, projectId } = req.params;
    const { performerId } = req.body;
    const { user } = req;

    const { error } = assignTaskSchema.validate({ taskId, projectId, performerId });
    if (error) throw error;

    await this.taskRepository.assignTask({
      taskId: Number(taskId),
      userId: Number(user!.userId),
      projectId: Number(projectId),
      performerId: Number(performerId),
    });
  };

  changeTaskStatus = async (req: Request<ChangeTaskStatusParams, unknown, ChangeTaskStatusBody>): Promise<void> => {
    const { user } = req;
    const { status } = req.body;
    const { taskId, projectId } = req.params;

    const { error } = changeTaskStatusSchema.validate({ taskId, projectId, status });
    if (error) throw error;

    await this.taskRepository.updateTaskStatus({
      taskId: Number(taskId),
      projectId: Number(projectId),
      userId: Number(user!.userId),
      newStatus: status,
    });
  };

  deleteTask = async (req: Request<DeleteTaskParams>): Promise<void> => {
    const { projectId, taskId } = req.params;
    const { user } = req;

    const { error } = deleteTaskSchema.validate(req.params);
    if (error) throw error;

    await this.taskRepository.deleteTask({
      taskId: Number(taskId),
      projectId: Number(projectId),
      userId: user!.userId,
    });
  };
}
