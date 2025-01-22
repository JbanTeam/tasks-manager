import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { createProject, getProjects } from '../db/project';

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';

const getAllProjects = async (req: Request, res: Response) => {
  const projects = await getProjects();
  res.json(projects);
};

const initProject = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ errorMessage: 'Unauthorized.' });
    }

    const decodedUser = jwt.verify(token, JWT_SECRET);
    const authorId = req.params.userId;

    if (typeof decodedUser !== 'object' || !('userId' in decodedUser)) {
      return res.status(401).json({ errorMessage: 'Invalid token.' });
    }

    if (decodedUser.userId !== Number(authorId)) return res.status(401).json({ errorMessage: 'Unauthorized.' });

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ errorMessage: 'Title is required.' });
    }

    await createProject({ title, description, authorId: Number(authorId) });

    res.status(201).json({
      message: 'Project created successfully.',
    });
  } catch (error) {
    console.error('Failed to init new project:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ errorMessage: 'Invalid token.' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ errorMessage: 'Token expired.' });
    }
    res.status(500).json({ error, errorMessage: 'Failed to init new project.' });
  }
};

export { getAllProjects, initProject };
