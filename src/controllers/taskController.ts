import { NextFunction, Request, Response } from 'express';
import { TaskStatus } from '@prisma/client';
import { assignTask, createTask, updateTaskStatus } from '../db/functions/task';
import HttpError from '../errors/HttpError';

const addTaskToProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    const { title, description, deadline } = req.body;
    const { projectId } = req.params;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    if (!title || !deadline) {
      throw new HttpError({ code: 400, message: 'Title and deadline are required.' });
    }

    await createTask({ title, description, deadline, projectId: Number(projectId) }, user.userId);

    res.status(201).json({
      message: 'Task created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const assignTaskToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, projectId } = req.params;
    const { performerId } = req.body;
    const { user } = req;

    if (!performerId) throw new HttpError({ code: 400, message: 'Performer ID is required.' });

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await assignTask(Number(taskId), Number(user.userId), Number(projectId), Number(performerId));

    res.status(201).json({
      message: 'Performer assigned successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const changeTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, projectId } = req.params;
    const status: TaskStatus = req.body.status;
    const { user } = req;

    if (!user) return res.status(401).json({ errorMessage: 'Unauthorized.' });

    await updateTaskStatus(Number(taskId), Number(projectId), Number(user.userId), status);

    res.status(201).json({
      message: 'Task status changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export { addTaskToProject, assignTaskToUser, changeTaskStatus };
