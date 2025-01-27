import { NextFunction, Request, Response } from 'express';

import { createProject, getProjects, projectTime, projectsByUser, userToPoject } from '../db/project';
import HttpError from '../errors/HttpError';
import { formatMilliseconds } from '../utils';

const getAllProjects = async (req: Request, res: Response) => {
  const projects = await getProjects();
  res.status(200).json(projects);
};

const getProjectsByUser = async (req: Request, res: Response) => {
  const { user } = req;

  if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

  const projects = await projectsByUser(user.userId);
  res.status(200).json(projects);
};

const initProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    const { title, description } = req.body;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    if (!title) throw new HttpError({ code: 400, message: 'Title is required.' });

    await createProject({ title, description, authorId: Number(user.userId) });

    res.status(201).json({
      message: 'Project created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const addUserToProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    const { projectId } = req.params;
    const { addedUserId } = req.body;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    if (!projectId) throw new HttpError({ code: 400, message: 'Project ID is required.' });
    if (!addedUserId) throw new HttpError({ code: 401, message: 'User ID is required.' });

    await userToPoject(Number(projectId), Number(user.userId), Number(addedUserId));

    res.status(201).json({
      message: 'User added successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getProjectTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    const { projectId } = req.params;
    const timeFilter: string = req.query.timeFilter as string;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    if (!projectId) throw new HttpError({ code: 400, message: 'Project ID is required.' });

    const totalMillisec = await projectTime(Number(projectId), timeFilter);
    const time = formatMilliseconds(totalMillisec);

    res.status(200).json(time);
  } catch (error) {
    next(error);
  }
};

export { getAllProjects, getProjectsByUser, initProject, addUserToProject, getProjectTime };
