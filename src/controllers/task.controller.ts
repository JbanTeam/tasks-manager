import { NextFunction, Request, Response } from 'express';

import { TaskService } from '@src/services/task.service';
import {
  AddTaskBody,
  AddTaskParams,
  AssignTaskBody,
  AssignTaskParams,
  ChangeTaskStatusBody,
  ChangeTaskStatusParams,
  DeleteTaskParams,
} from '@src/types/reqTypes';

export class TaskController {
  private readonly taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  addTaskToProject = async (
    req: Request<AddTaskParams, unknown, AddTaskBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.taskService.addTaskToProject(req);
      res.status(201).json({
        message: 'Task created successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  assignTaskToUser = async (
    req: Request<AssignTaskParams, unknown, AssignTaskBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.taskService.assignTaskToUser(req);
      res.status(200).json({
        message: 'Performer assigned successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  changeTaskStatus = async (
    req: Request<ChangeTaskStatusParams, unknown, ChangeTaskStatusBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.taskService.changeTaskStatus(req);
      res.status(200).json({
        message: 'Task status changed successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request<DeleteTaskParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.taskService.deleteTask(req);
      res.status(200).json({
        message: 'Task deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
