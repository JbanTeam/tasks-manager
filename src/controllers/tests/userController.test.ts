import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

import { server } from '../../index';
import { createUser, userByEmail } from '../../db/functions/user';
import { loginSchema, registrationSchema } from '../../utils/validation';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../db/functions/user');
jest.mock('../../utils/validation');

const mockUser = { id: 1, name: 'Vital Alex', email: 'vital@mail.ru', password: 'hashedPassword' };
const hashedPassword = 'hashedPassword';
const token = 'token';

afterAll(done => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe('UserController SignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('SignUp successfully', async () => {
    (registrationSchema.validate as jest.Mock).mockReturnValue({ error: null });
    (userByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    (createUser as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const response = await request(server).post('/api/signup').send({
      name: 'Vital Alex',
      email: 'vital@mail.ru',
      password: '123',
      confirmPassword: '123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      userId: mockUser.id,
      token,
    });
    expect(createUser).toHaveBeenCalledWith({
      name: 'Vital Alex',
      email: 'vital@mail.ru',
      password: hashedPassword,
    });
  });

  test('SignUp with empty fields, must return validation error', async () => {
    const validationError = new Joi.ValidationError(
      'Validation error',
      [
        {
          message: 'Name is required',
          path: ['name'],
          type: 'any.required',
          context: {
            label: 'name',
            key: 'name',
          },
        },
      ],
      null,
    );

    (registrationSchema.validate as jest.Mock).mockReturnValue({ error: validationError });

    const response = await request(server).post('/api/signup').send({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(createUser).not.toHaveBeenCalled();
  });

  test('SignUp with existing email, must return error', async () => {
    (registrationSchema.validate as jest.Mock).mockReturnValue({ error: null });
    (userByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'vital@mail.ru' });

    const response = await request(server).post('/api/signup').send({
      name: 'Vital Alex',
      email: 'vital@mail.ru',
      password: '123',
      confirmPassword: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(createUser).not.toHaveBeenCalled();
  });

  test('SignUp database connection error', async () => {
    (registrationSchema.validate as jest.Mock).mockReturnValue({ error: null });
    (userByEmail as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const response = await request(server).post('/api/signup').send({
      name: 'Vital Alex',
      email: 'vital@mail.ru',
      password: '123',
      confirmPassword: '123',
    });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('errors');
  });
});

describe('UserController SignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('SignIn successfully', async () => {
    (loginSchema.validate as jest.Mock).mockReturnValue({ error: null });
    (userByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const response = await request(server).post('/api/signin').send({
      email: 'vital@mail.ru',
      password: '123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: mockUser.id,
      token,
    });
    expect(userByEmail).toHaveBeenCalledWith('vital@mail.ru');
    expect(bcrypt.compare).toHaveBeenCalledWith('123', mockUser.password);
    expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUser.id, email: mockUser.email }, expect.any(String), {
      expiresIn: '7 days',
    });
  });

  test('SignIn with invalid credentials, must return error', async () => {
    (loginSchema.validate as jest.Mock).mockReturnValue({ error: null });
    (userByEmail as jest.Mock).mockResolvedValue(null);

    const response = await request(server).post('/api/signin').send({
      email: 'fff@mail.ru',
      password: '123',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');

    expect(userByEmail).toHaveBeenCalledWith('fff@mail.ru');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});
