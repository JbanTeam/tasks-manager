import { NextFunction, Request, Response } from 'express';

import HttpError from '../errors/HttpError';
import { taskSchema } from '../utils/validation';
import { assignTask, createTask, deleteTask, updateTaskStatus } from '../db/functions/task';
import {
  AddTaskBody,
  AddTaskParams,
  AssignTaskBody,
  AssignTaskParams,
  ChangeTaskStatusBody,
  ChangeTaskStatusParams,
} from '@src/types';

const addTaskToProject = async (
  req: Request<AddTaskParams, unknown, AddTaskBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req;
    const { title, description, deadline } = req.body;
    const { projectId } = req.params;

    const { error } = taskSchema.validate(req.body);
    if (error) throw error;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await createTask({ taskData: { title, description, deadline, projectId: Number(projectId) }, userId: user.userId });

    res.status(201).json({
      message: 'Task created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const assignTaskToUser = async (
  req: Request<AssignTaskParams, unknown, AssignTaskBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId, projectId } = req.params;
    const { performerId } = req.body;
    const { user } = req;

    if (!performerId) throw new HttpError({ code: 400, message: 'Performer ID is required.' });

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await assignTask({
      taskId: Number(taskId),
      userId: Number(user.userId),
      projectId: Number(projectId),
      performerId: Number(performerId),
    });

    res.status(200).json({
      message: 'Performer assigned successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const changeTaskStatus = async (
  req: Request<ChangeTaskStatusParams, unknown, ChangeTaskStatusBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId, projectId } = req.params;
    const { status } = req.body;
    const { user } = req;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await updateTaskStatus({
      taskId: Number(taskId),
      projectId: Number(projectId),
      userId: Number(user.userId),
      newStatus: status,
    });

    res.status(200).json({
      message: 'Task status changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const deleteTaskFromDb = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    const { projectId, taskId } = req.params;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await deleteTask({ taskId: Number(taskId), projectId: Number(projectId), userId: user.userId });

    res.status(200).json({
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export { addTaskToProject, assignTaskToUser, changeTaskStatus, deleteTaskFromDb };
