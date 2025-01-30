import request from 'supertest';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../constants';

import { server } from '../../index';
import { createTask, assignTask, updateTaskStatus } from '../../db/functions/task';
import HttpError from '../../errors/HttpError';

jest.mock('../../db/functions/task');

const mockUser = {
  userId: 1,
  email: 'vital@mail.ru',
};
const mockTask = {
  id: 1,
  title: 'Super task',
  description: 'Super description',
  projectId: 1,
  deadline: '2025-02-22T11:56:53.206Z',
  performerId: 1,
};
const mockToken = jwt.sign({ userId: 1, email: 'vital@mail.ru' }, JWT_SECRET, { expiresIn: '7 days' });

afterAll(done => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe('TaskController AddTaskToProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Add task to project successfully', async () => {
    (createTask as jest.Mock).mockResolvedValue(mockTask);

    const response = await request(server)
      .post('/api/projects/1/tasks')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Super task',
        description: 'Super description',
        deadline: '2025-02-22T11:56:53.206Z',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Task created successfully.',
    });
    expect(createTask).toHaveBeenCalledWith({
      taskData: {
        title: 'Super task',
        description: 'Super description',
        deadline: '2025-02-22T11:56:53.206Z',
        projectId: 1,
      },
      userId: 1,
    });
  });

  test('Add task to project with no authorization, iniciator unauthorized, must return error', async () => {
    const response = await request(server).post('/api/projects/1/tasks').send({
      title: 'Super task',
      description: 'Super description',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(createTask).not.toHaveBeenCalled();
  });

  test('Add task to project with no title and deadline, must return error', async () => {
    const response = await request(server)
      .post('/api/projects/1/tasks')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        description: 'Super description',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(createTask).not.toHaveBeenCalled();
  });

  test('Add task to project database connection error, must return error', async () => {
    (createTask as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const response = await request(server)
      .post('/api/projects/1/tasks')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Super task',
        description: 'Super description',
        deadline: '2025-02-22T11:56:53.206Z',
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('errors');
    expect(createTask).toHaveBeenCalledWith({
      taskData: {
        title: 'Super task',
        description: 'Super description',
        deadline: '2025-02-22T11:56:53.206Z',
        projectId: 1,
      },
      userId: 1,
    });
  });
});

describe('TaskController AssignTaskToUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Assign task to user successfully', async () => {
    (assignTask as jest.Mock).mockResolvedValue(mockTask);

    const response = await request(server)
      .patch('/api/projects/1/tasks/1/assign')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        performerId: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Performer assigned successfully.',
    });
    expect(assignTask).toHaveBeenCalledWith({
      taskId: 1,
      userId: 1,
      projectId: 1,
      performerId: 1,
    });
  });

  test('Assign task to user with no performerId, must return error', async () => {
    const response = await request(server)
      .patch('/api/projects/1/tasks/1/assign')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(assignTask).not.toHaveBeenCalled();
  });

  test('Assign task to user if task not belong to project, must return error', async () => {
    (assignTask as jest.Mock).mockRejectedValue(new HttpError({ code: 404, message: 'Task not found.' }));

    const response = await request(server)
      .patch('/api/projects/1/tasks/1/assign')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ performerId: 1 });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('errors');
    expect(assignTask).toHaveBeenCalledWith({
      taskId: 1,
      userId: 1,
      projectId: 1,
      performerId: 1,
    });
  });
});

describe('TaskController ChangeTaskStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Change task status successfully', async () => {
    (updateTaskStatus as jest.Mock).mockResolvedValue(mockTask);

    const response = await request(server)
      .patch('/api/projects/1/tasks/1/status')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        status: 'IN_PROGRESS',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Task status changed successfully.',
    });
    expect(updateTaskStatus).toHaveBeenCalledWith({ taskId: 1, userId: 1, projectId: 1, newStatus: 'IN_PROGRESS' });
  });
});
