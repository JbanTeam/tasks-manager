import { NextFunction, Request, Response } from 'express';

import { ProjectService } from '../services/project.service';
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

export class ProjectController {
  private readonly projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getAllProjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await this.projectService.getAllProjects();
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  };

  getProjectsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await this.projectService.getProjectsByUser(req);
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  };

  initProject = async (
    req: Request<unknown, unknown, InitProjectBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.projectService.initProject(req);

      res.status(201).json({
        message: 'Project created successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  addUserToProject = async (
    req: Request<AddUserToProjectParams, unknown, AddUserToProjectBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.projectService.addUserToProject(req);

      res.status(200).json({
        message: 'User added successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  removeUserFromProject = async (
    req: Request<RemoveUserFromProjectParams, unknown, RemoveUserFromProjectBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.projectService.removeUserFromProject(req);

      res.status(200).json({
        message: 'User removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectTime = async (
    req: Request<ProjectTimeParams, unknown, unknown, ProjectTimeQuery>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const time = await this.projectService.getProjectTime(req);
      res.status(200).json(time);
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request<DeleteProjectParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.projectService.deleteProject(req);

      res.status(200).json({
        message: 'Project deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
