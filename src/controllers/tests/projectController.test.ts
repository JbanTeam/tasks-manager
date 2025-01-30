import request from 'supertest';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../constants';

import { server } from '../../index';
import { createProject } from '../../db/functions/project';

jest.mock('../../db/functions/project');
const mockUser = {
  userId: 1,
  email: 'vital@mail.ru',
};
const mockProject = { id: 1, title: 'Super project', description: 'Super description', authorId: 1 };
const mockToken = jwt.sign({ userId: 1, email: 'vital@mail.ru' }, JWT_SECRET, { expiresIn: '7 days' });

afterAll(done => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe('ProjectController InitProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Init Project successfully', async () => {
    (createProject as jest.Mock).mockResolvedValue(mockProject);

    const response = await request(server).post('/api/projects').set('Authorization', `Bearer ${mockToken}`).send({
      title: 'Super project',
      description: 'Super description',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Project created successfully.',
    });
    expect(createProject).toHaveBeenCalledWith({
      title: 'Super project',
      description: 'Super description',
      authorId: mockUser.userId,
    });
  });

  test('Init Project with no authorization, must return error', async () => {
    const response = await request(server).post('/api/projects').send({
      title: 'Super project',
      description: 'Super description',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors', [{ message: 'Unauthorized.', context: {} }]);
    expect(createProject).not.toHaveBeenCalled();
  });

  test('Init Project with no title, must return error', async () => {
    const mockToken = jwt.sign({ userId: 1, email: 'vital@mail.ru' }, JWT_SECRET, { expiresIn: '7 days' });
    const response = await request(server).post('/api/projects').set('Authorization', `Bearer ${mockToken}`).send({
      description: 'Super description',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(createProject).not.toHaveBeenCalled();
  });

  test('Init Project database connection error, must return error', async () => {
    const mockToken = jwt.sign({ userId: 1, email: 'vital@mail.ru' }, JWT_SECRET, { expiresIn: '7 days' });

    (createProject as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const response = await request(server).post('/api/projects').set('Authorization', `Bearer ${mockToken}`).send({
      title: 'Super project',
      description: 'Super description',
    });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('errors');
    expect(createProject).toHaveBeenCalledWith({
      title: 'Super project',
      description: 'Super description',
      authorId: mockUser.userId,
    });
  });
});
