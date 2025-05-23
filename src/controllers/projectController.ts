import { NextFunction, Request, Response } from 'express';

import HttpError from '../errors/HttpError';
import { formatMilliseconds } from '../utils/time';
import { projectSchema } from '../utils/validation';
import {
  AddUserToProjectBody,
  AddUserToProjectParams,
  InitProjectBody,
  RemoveUserFromProjectBody,
  RemoveUserFromProjectParams,
} from '@src/types/reqTypes';
import {
  createProject,
  deleteProject,
  getProjects,
  projectTime,
  projectsByUser,
  userFromPoject,
  userToPoject,
} from '../db/functions/project';

const getAllProjects = async (_req: Request, res: Response): Promise<void> => {
  const projects = await getProjects();
  res.status(200).json(projects);
};

const getProjectsByUser = async (req: Request, res: Response): Promise<void> => {
  const { user } = req;

  if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

  const projects = await projectsByUser(user.userId);
  res.status(200).json(projects);
};

const initProject = async (
  req: Request<unknown, unknown, InitProjectBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req;
    const { title, description } = req.body;

    const { error } = projectSchema.validate(req.body);
    if (error) throw error;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await createProject({ title, description, authorId: Number(user.userId) });

    res.status(201).json({
      message: 'Project created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const addUserToProject = async (
  req: Request<AddUserToProjectParams, unknown, AddUserToProjectBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req;
    const { projectId } = req.params;
    const { addedUserId } = req.body;
    // TODO: validation
    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    if (!projectId) throw new HttpError({ code: 400, message: 'Project ID is required.' });
    if (!addedUserId) throw new HttpError({ code: 400, message: 'Added user ID is required.' });

    await userToPoject({
      projectId: Number(projectId),
      authorId: Number(user.userId),
      addedUserId: Number(addedUserId),
    });

    res.status(200).json({
      message: 'User added successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const removeUserFromProject = async (
  req: Request<RemoveUserFromProjectParams, unknown, RemoveUserFromProjectBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req;
    const { projectId } = req.params;
    const { removedUserId } = req.body;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    if (!projectId) throw new HttpError({ code: 400, message: 'Project ID is required.' });
    if (!removedUserId) throw new HttpError({ code: 400, message: 'Removed user ID is required.' });
    if (user.userId === Number(removedUserId))
      throw new HttpError({ code: 400, message: 'You cannot remove yourself.' });

    await userFromPoject({
      projectId: Number(projectId),
      authorId: Number(user.userId),
      removedUserId: Number(removedUserId),
    });

    res.status(200).json({
      message: 'User removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getProjectTime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user } = req;
    const { projectId } = req.params;
    const timeFilter: string = req.query.timeFilter as string;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    if (!projectId) throw new HttpError({ code: 400, message: 'Project ID is required.' });

    const totalMs = await projectTime({ projectId: Number(projectId), timeFilter });
    const time = formatMilliseconds(totalMs);

    res.status(200).json(time);
  } catch (error) {
    next(error);
  }
};

const deleteProjectFromDb = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user } = req;
    const { projectId } = req.params;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await deleteProject({ projectId: Number(projectId), authorId: Number(user.userId) });

    res.status(200).json({
      message: 'Project deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllProjects,
  getProjectsByUser,
  initProject,
  deleteProjectFromDb,
  addUserToProject,
  removeUserFromProject,
  getProjectTime,
};
