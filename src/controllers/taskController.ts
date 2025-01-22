import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { createTask } from '../db/task';

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';

const initTask = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ errorMessage: 'Unauthorized.' });
    }

    const decodedUser = jwt.verify(token, JWT_SECRET);
    const { projectId } = req.params;

    if (typeof decodedUser !== 'object' || !('userId' in decodedUser)) {
      return res.status(401).json({ errorMessage: 'Invalid token.' });
    }

    const { title, description, deadline } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ errorMessage: 'Title and deadline are required.' });
    }

    await createTask({ title, description, deadline, projectId: Number(projectId) });

    res.status(201).json({
      message: 'Task created successfully.',
    });
  } catch (error) {
    console.error('Failed to init new task:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ errorMessage: 'Invalid token.' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ errorMessage: 'Token expired.' });
    }
    res.status(500).json({ error, errorMessage: 'Failed to init new task.' });
  }
};

const assignTaskToUser = async (req: Request, res: Response) => {
  try {
    const { taskId, userId } = req.body;
  } catch (error) {
    console.error('Failed to assign task:', error);
    res.status(500).json({ error, errorMessage: 'Failed to assign task.' });
  }
};

export { initTask, assignTaskToUser };
