import { Request } from 'express';
import { Project, TaskStatus } from '@prisma/client';

import HttpError from '@src/errors/HttpError';
import { ProjectTimeFilter } from '@src/types';
import { ProjectRepository } from '../db/repositories/project.repository';
import { formatMilliseconds, timeDifference } from '../utils/time';
import { ProjectFullType, ProjectTimeType, TaskType } from '../types';
import {
  addUserToProjectSchema,
  deleteProjectSchema,
  projectSchema,
  projectTimeSchema,
  removeUserFromProjectSchema,
} from '@src/utils/validation';
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

export class ProjectService {
  private readonly projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  getAllProjects = async (): Promise<ProjectFullType[]> => {
    return this.projectRepository.getProjects();
  };

  getProjectsByUser = async (req: Request): Promise<ProjectFullType[]> => {
    const { user } = req;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    return this.projectRepository.projectsByUser(user.userId);
  };

  initProject = async (req: Request<unknown, unknown, InitProjectBody>): Promise<Project> => {
    const { user } = req;
    const { title, description } = req.body;

    const { error } = projectSchema.validate(req.body);
    if (error) throw error;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    return this.projectRepository.createProject({
      title,
      description,
      authorId: user.userId,
    });
  };

  addUserToProject = async (req: Request<AddUserToProjectParams, unknown, AddUserToProjectBody>): Promise<void> => {
    const { user } = req;
    const { projectId } = req.params;
    const { addedUserId } = req.body;

    const { error } = addUserToProjectSchema.validate({ projectId, addedUserId });
    if (error) throw error;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    await this.projectRepository.addUserToPoject({
      projectId: Number(projectId),
      authorId: user.userId,
      addedUserId: Number(addedUserId),
    });
  };

  removeUserFromProject = async (
    req: Request<RemoveUserFromProjectParams, unknown, RemoveUserFromProjectBody>,
  ): Promise<void> => {
    const { user } = req;
    const { projectId } = req.params;
    const { removedUserId } = req.body;

    const { error } = removeUserFromProjectSchema.validate({ projectId, removedUserId });
    if (error) throw error;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    if (user.userId === Number(removedUserId)) {
      throw new HttpError({ code: 400, message: 'You cannot remove yourself.' });
    }

    await this.projectRepository.removeUserFromPoject({
      projectId: Number(projectId),
      removedUserId: Number(removedUserId),
      authorId: user.userId,
    });
  };

  getProjectTime = async (
    req: Request<ProjectTimeParams, unknown, unknown, ProjectTimeQuery>,
  ): Promise<ProjectTimeType> => {
    const { user } = req;
    const { projectId } = req.params;
    const { timeFilter } = req.query;

    const { error } = projectTimeSchema.validate({ projectId, timeFilter });
    if (error) throw error;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });

    const project = await this.projectRepository.getProject(Number(projectId));
    const totalMs = this.calculateProjectTime(project.tasks, timeFilter);
    const time = formatMilliseconds(totalMs);

    return time;
  };

  deleteProject = async (req: Request<DeleteProjectParams>): Promise<void> => {
    const { user } = req;
    const { projectId } = req.params;

    const { error } = deleteProjectSchema.validate({ projectId });
    if (error) throw error;

    if (!user) throw new HttpError({ code: 401, message: 'Unauthorized.' });
    await this.projectRepository.deleteProject({ projectId: Number(projectId), authorId: user.userId });
  };

  calculateProjectTime = (tasks: TaskType[], filterTime?: ProjectTimeFilter): number => {
    const { now, filterDate } = this.assignFilterDate(filterTime);

    const totalMs = tasks.reduce((acc: number, task: TaskType) => {
      if (!task.beginAt) return acc;
      const taskBeginAt = new Date(task.beginAt);
      const taskDoneAt = task.doneAt ? new Date(task.doneAt) : now;

      if (filterDate) {
        const effectiveStart = taskBeginAt > filterDate ? taskBeginAt : filterDate;

        if (effectiveStart >= taskDoneAt) return acc;

        const { ms } = timeDifference(effectiveStart, taskDoneAt);

        acc += ms;
      } else {
        if (task.status === TaskStatus.IN_PROGRESS) {
          const { ms } = timeDifference(task.beginAt, now);
          acc += ms;
        } else if (task.status === TaskStatus.DONE) {
          acc += Number(task.spentTime);
        }
      }

      return acc;
    }, 0);

    return totalMs;
  };

  private assignFilterDate = (filterTime?: ProjectTimeFilter): { now: Date; filterDate: Date | null } => {
    const now = new Date();
    let filterDate: Date | null = new Date();

    switch (filterTime) {
      case ProjectTimeFilter.WEEK:
        filterDate.setDate(now.getDate() - 7);
        break;
      case ProjectTimeFilter.MONTH:
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case ProjectTimeFilter.HOUR:
        filterDate.setHours(now.getHours() - 24);
        break;
      default:
        filterDate = null;
        break;
    }
    return { now, filterDate };
  };
}
