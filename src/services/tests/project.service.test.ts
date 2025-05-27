import { Request } from 'express';
import { Project, TaskStatus } from '@prisma/client';

import * as timeUtils from '@src/utils/time';
import HttpError from '@src/errors/HttpError';
import { ProjectService } from '@src/services/project.service';
import { ProjectRepository } from '@src/db/repositories/project.repository';
import { ProjectFullType, ProjectTimeFilter, ProjectTimeType, TaskType } from '@src/types';
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

jest.mock('@src/db/repositories/project.repository');
jest.mock('@src/utils/time', () => ({
  ...(jest.requireActual('@src/utils/time') as unknown as typeof timeUtils),
  formatMilliseconds: jest.fn(),
}));

const mockProjectRepository = new ProjectRepository() as jest.Mocked<ProjectRepository>;
const mockFormatMilliseconds = timeUtils.formatMilliseconds as jest.MockedFunction<typeof timeUtils.formatMilliseconds>;

const mockUser = { userId: 1, email: 'vital@mail.ru.com' };

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    jest.clearAllMocks();
    projectService = new ProjectService();
    // @ts-expect-error: overriding private dependency for unit test
    projectService['projectRepository'] = mockProjectRepository;
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const projects = [{ id: 1, title: 'Project 1' }] as ProjectFullType[];
      mockProjectRepository.getProjects = jest.fn().mockResolvedValue(projects);

      const result = await projectService.getAllProjects();

      expect(mockProjectRepository.getProjects).toHaveBeenCalled();
      expect(result).toEqual(projects);
    });

    it('should throw an error if repository fails', async () => {
      const error = new Error('DB error');
      mockProjectRepository.getProjects = jest.fn().mockRejectedValue(error);

      await expect(projectService.getAllProjects()).rejects.toThrow(error);
    });
  });

  describe('getProjectsByUser', () => {
    it('should return projects for a user', async () => {
      const req = { user: mockUser } as Request;
      const projects = [{ id: 1, title: 'User Project' }] as ProjectFullType[];
      mockProjectRepository.projectsByUser = jest.fn().mockResolvedValue(projects);

      const result = await projectService.getProjectsByUser(req);

      expect(mockProjectRepository.projectsByUser).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual(projects);
    });

    it('should throw error if user is not authenticated', async () => {
      const req = { user: undefined } as Request;

      await expect(projectService.getProjectsByUser(req)).rejects.toThrow(
        new HttpError({ code: 401, message: 'Unauthorized.' }),
      );
    });
  });

  describe('initProject', () => {
    const initProjectBody: InitProjectBody = { title: 'Project', description: 'Description' };
    const req = { user: mockUser, body: initProjectBody } as Request<unknown, unknown, InitProjectBody>;

    it('should initialize a project', async () => {
      const newProject = { id: 1, ...initProjectBody, authorId: mockUser.userId } as Project;
      mockProjectRepository.createProject = jest.fn().mockResolvedValue(newProject);

      const result = await projectService.initProject(req);

      expect(mockProjectRepository.createProject).toHaveBeenCalledWith({
        title: initProjectBody.title,
        description: initProjectBody.description,
        authorId: mockUser.userId,
      });
      expect(result).toEqual(newProject);
    });

    it('should throw error if user is not authenticated', async () => {
      req.user = undefined;
      await expect(projectService.initProject(req)).rejects.toThrow(
        new HttpError({ code: 401, message: 'Unauthorized.' }),
      );
    });

    it('should throw validation error if body is invalid', async () => {
      const invalidReq = { user: mockUser, body: { title: '' } } as Request<unknown, unknown, InitProjectBody>;
      await expect(projectService.initProject(invalidReq)).rejects.toThrow();
    });
  });

  describe('addUserToProject', () => {
    const addUserParams: AddUserToProjectParams = { projectId: '1' };
    const addUserBody: AddUserToProjectBody = { addedUserId: 2 };
    const req = { user: mockUser, params: addUserParams, body: addUserBody } as Request<
      AddUserToProjectParams,
      unknown,
      AddUserToProjectBody
    >;

    it('should add a user to a project', async () => {
      mockProjectRepository.addUserToPoject = jest.fn().mockResolvedValue(undefined);

      await projectService.addUserToProject(req);

      expect(mockProjectRepository.addUserToPoject).toHaveBeenCalledWith({
        projectId: Number(addUserParams.projectId),
        authorId: mockUser.userId,
        addedUserId: addUserBody.addedUserId,
      });
    });

    it('should throw error if user is not authenticated', async () => {
      req.user = undefined;
      await expect(projectService.addUserToProject(req)).rejects.toThrow(
        new HttpError({ code: 401, message: 'Unauthorized.' }),
      );
    });

    it('should throw validation error if params/body are invalid', async () => {
      const invalidReq = { user: mockUser, params: {}, body: addUserBody } as Request<
        AddUserToProjectParams,
        unknown,
        AddUserToProjectBody
      >;
      await expect(projectService.addUserToProject(invalidReq)).rejects.toThrow();
    });
  });

  describe('removeUserFromProject', () => {
    const removeUserParams: RemoveUserFromProjectParams = { projectId: '1' };
    const removeUserBody: RemoveUserFromProjectBody = { removedUserId: 2 };
    let req: Request<RemoveUserFromProjectParams, unknown, RemoveUserFromProjectBody>;

    beforeEach(() => {
      req = {
        user: mockUser,
        params: removeUserParams,
        body: removeUserBody,
      } as Request<RemoveUserFromProjectParams, unknown, RemoveUserFromProjectBody>;
    });

    it('should remove a user from a project', async () => {
      mockProjectRepository.removeUserFromPoject = jest.fn().mockResolvedValue(undefined);

      await projectService.removeUserFromProject(req);

      expect(mockProjectRepository.removeUserFromPoject).toHaveBeenCalledWith({
        projectId: Number(removeUserParams.projectId),
        removedUserId: removeUserBody.removedUserId,
        authorId: mockUser.userId,
      });
    });

    it('should throw error if user is not authenticated', async () => {
      req.user = undefined;
      await expect(projectService.removeUserFromProject(req)).rejects.toThrow(
        new HttpError({ code: 401, message: 'Unauthorized.' }),
      );
    });

    it('should throw error if user tries to remove themselves', async () => {
      req.body.removedUserId = mockUser.userId;
      await expect(projectService.removeUserFromProject(req)).rejects.toThrow(
        new HttpError({ code: 400, message: 'You cannot remove yourself.' }),
      );
    });

    it('should throw validation error if params/body are invalid', async () => {
      const invalidReq = { user: mockUser, params: {}, body: removeUserBody } as Request<
        RemoveUserFromProjectParams,
        unknown,
        RemoveUserFromProjectBody
      >;
      await expect(projectService.removeUserFromProject(invalidReq)).rejects.toThrow();
    });
  });

  describe('getProjectTime', () => {
    const projectTimeParams: ProjectTimeParams = { projectId: '1' };
    const projectTimeQuery: ProjectTimeQuery = { timeFilter: ProjectTimeFilter.MONTH };
    const req = { user: mockUser, params: projectTimeParams, query: projectTimeQuery } as Request<
      ProjectTimeParams,
      unknown,
      unknown,
      ProjectTimeQuery
    >;
    const mockProject = { id: 1, tasks: [] as TaskType[] } as ProjectFullType;
    const mockFormattedTime = { days: 1, hours: 2, minutes: 3 } as ProjectTimeType;

    it('should return project time', async () => {
      mockProjectRepository.getProject = jest.fn().mockResolvedValue(mockProject);
      jest.spyOn(projectService, 'calculateProjectTime').mockReturnValue(1000 * 60 * 60 * 26 + 1000 * 60 * 3);
      mockFormatMilliseconds.mockReturnValue(mockFormattedTime);

      const result = await projectService.getProjectTime(req);

      expect(mockProjectRepository.getProject).toHaveBeenCalledWith(Number(projectTimeParams.projectId));
      expect(projectService.calculateProjectTime).toHaveBeenCalledWith(mockProject.tasks, projectTimeQuery.timeFilter);
      expect(mockFormatMilliseconds).toHaveBeenCalledWith(1000 * 60 * 60 * 26 + 1000 * 60 * 3);
      expect(result).toEqual(mockFormattedTime);
    });

    it('should throw error if user is not authenticated', async () => {
      req.user = undefined;
      await expect(projectService.getProjectTime(req)).rejects.toThrow(
        new HttpError({ code: 401, message: 'Unauthorized.' }),
      );
    });

    it('should throw validation error if params/query are invalid', async () => {
      const invalidReq = { user: mockUser, params: {}, query: projectTimeQuery } as Request<
        ProjectTimeParams,
        unknown,
        unknown,
        ProjectTimeQuery
      >;
      await expect(projectService.getProjectTime(invalidReq)).rejects.toThrow();
    });
  });

  describe('deleteProject', () => {
    const deleteProjectParams: DeleteProjectParams = { projectId: '1' };
    const req = { user: mockUser, params: deleteProjectParams } as Request<DeleteProjectParams>;

    it('should delete a project', async () => {
      mockProjectRepository.deleteProject = jest.fn().mockResolvedValue(undefined);

      await projectService.deleteProject(req);

      expect(mockProjectRepository.deleteProject).toHaveBeenCalledWith({
        projectId: Number(deleteProjectParams.projectId),
        authorId: mockUser.userId,
      });
    });

    it('should throw error if user is not authenticated', async () => {
      req.user = undefined;
      await expect(projectService.deleteProject(req)).rejects.toThrow(
        new HttpError({ code: 401, message: 'Unauthorized.' }),
      );
    });

    it('should throw validation error if params are invalid', async () => {
      const invalidReq = { user: mockUser, params: {} } as Request<DeleteProjectParams>;
      await expect(projectService.deleteProject(invalidReq)).rejects.toThrow();
    });
  });

  describe('calculateProjectTime', () => {
    const now = new Date('2024-01-10T12:00:00.000Z');
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const tasks: TaskType[] = [
      {
        id: 1,
        title: 'T1',
        projectId: 1,
        status: TaskStatus.DONE,
        beginAt: new Date('2024-01-01T10:00:00Z'),
        doneAt: new Date('2024-01-01T12:00:00Z'),
        spentTime: 2 * 60 * 60 * 1000, // 2 hours
      } as unknown as TaskType,
      {
        id: 2,
        title: 'T2',
        projectId: 1,
        status: TaskStatus.IN_PROGRESS,
        beginAt: new Date('2024-01-09T10:00:00Z'),
        doneAt: null,
        spentTime: null,
      } as unknown as TaskType, // 1 day 2 hours from '2024-01-09T10:00:00Z' to '2024-01-10T12:00:00.000Z'
      {
        id: 3,
        title: 'T3',
        projectId: 1,
        status: TaskStatus.CREATED,
        beginAt: null,
        doneAt: null,
        spentTime: null,
      } as unknown as TaskType, // 0 hours
    ];

    it('should calculate total time for all tasks (no filter)', () => {
      const totalMs = projectService.calculateProjectTime(tasks);
      // Task 1: 2 hours (spentTime)
      // Task 2: 1 day 2 hours (26 hours) (IN_PROGRESS from beginAt to now)
      // Expected: 2 hours + 26 hours = 28 hours
      expect(totalMs).toBe(2 * 60 * 60 * 1000 + (24 + 2) * 60 * 60 * 1000);
    });

    it('should calculate total time for tasks within the last week', () => {
      // now is 2024-01-10T12:00:00.000Z
      // filterDate (1 week ago) is 2024-01-03T12:00:00.000Z
      const totalMs = projectService.calculateProjectTime(tasks, ProjectTimeFilter.WEEK);
      // Task 1 (DONE): beginAt 2024-01-01, doneAt 2024-01-01. effectiveStart = filterDate, doneAt = taskDoneAt. effectiveStart > taskDoneAt. So 0ms.
      // Task 2 (IN_PROGRESS): beginAt 2024-01-09. effectiveStart = taskBeginAt. taskDoneAt = now. (24+2) hours.
      // Expected: 26 hours
      expect(totalMs).toBe((24 + 2) * 60 * 60 * 1000);
    });

    it('should calculate total time for tasks within the last month', () => {
      // now is 2024-01-10T12:00:00.000Z
      // filterDate (1 month ago) is 2023-12-10T12:00:00.000Z
      const totalMs = projectService.calculateProjectTime(tasks, ProjectTimeFilter.MONTH);
      // Task 1 (DONE): beginAt 2024-01-01, doneAt 2024-01-01. effectiveStart = taskBeginAt. 2 hours.
      // Task 2 (IN_PROGRESS): beginAt 2024-01-09. effectiveStart = taskBeginAt. (24+2) hours.
      // Expected: 2 hours + 26 hours = 28 hours
      expect(totalMs).toBe(2 * 60 * 60 * 1000 + (24 + 2) * 60 * 60 * 1000);
    });

    it('should calculate total time for tasks within the last 24 hours (filter: HOUR)', () => {
      // now is 2024-01-10T12:00:00.000Z
      // filterDate (24 hours ago) is 2024-01-09T12:00:00.000Z
      const totalMs = projectService.calculateProjectTime(tasks, ProjectTimeFilter.HOUR);
      // Task 1 (DONE): beginAt 2024-01-01, doneAt 2024-01-01. effectiveStart = filterDate, doneAt = taskDoneAt. effectiveStart > taskDoneAt. So 0ms.
      // Task 2 (IN_PROGRESS): beginAt 2024-01-09T10:00:00Z. effectiveStart = filterDate (2024-01-09T12:00:00Z). taskDoneAt = now (2024-01-10T12:00:00Z). 24 hours.
      // Expected: 24 hours
      expect(totalMs).toBe(24 * 60 * 60 * 1000);
    });

    it('should return 0 if no tasks have time spent', () => {
      const noTimeTasks: TaskType[] = [
        {
          id: 1,
          title: 'T1',
          projectId: 1,
          status: TaskStatus.CREATED,
          beginAt: null,
          doneAt: null,
          spentTime: null,
        } as unknown as TaskType,
      ];
      const totalMs = projectService.calculateProjectTime(noTimeTasks);
      expect(totalMs).toBe(0);
    });

    it('should handle tasks with beginAt but no doneAt (IN_PROGRESS) correctly with filter', () => {
      const taskInProgress: TaskType[] = [
        {
          id: 1,
          title: 'In Progress Task',
          projectId: 1,
          status: TaskStatus.IN_PROGRESS,
          beginAt: new Date('2024-01-10T08:00:00Z'),
          doneAt: null,
          spentTime: null,
        } as unknown as TaskType,
      ];
      // now is 2024-01-10T12:00:00.000Z
      // filterDate (1 week ago) is 2024-01-03T12:00:00.000Z
      // effectiveStart = taskBeginAt (2024-01-10T08:00:00Z)
      // taskDoneAt = now (2024-01-10T12:00:00.000Z)
      // Difference is 4 hours.
      const totalMs = projectService.calculateProjectTime(taskInProgress, ProjectTimeFilter.WEEK);
      expect(totalMs).toBe(4 * 60 * 60 * 1000);
    });

    it('should handle tasks done before filter period correctly', () => {
      const taskDoneLongAgo: TaskType[] = [
        {
          id: 1,
          title: 'Old Done Task',
          projectId: 1,
          status: TaskStatus.DONE,
          beginAt: new Date('2023-12-01T10:00:00Z'),
          doneAt: new Date('2023-12-01T12:00:00Z'),
          spentTime: 2 * 60 * 60 * 1000,
        } as unknown as TaskType,
      ];
      // now is 2024-01-10T12:00:00.000Z
      // filterDate (1 week ago) is 2024-01-03T12:00:00.000Z
      // effectiveStart = filterDate (2024-01-03T12:00:00.000Z)
      // taskDoneAt = task.doneAt (2023-12-01T12:00:00Z)
      // effectiveStart > taskDoneAt, 0ms.
      const totalMs = projectService.calculateProjectTime(taskDoneLongAgo, ProjectTimeFilter.WEEK);
      expect(totalMs).toBe(0);
    });
  });
});
