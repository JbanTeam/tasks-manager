import { Request, Response } from 'express';
import { createProject, getProjects } from '../db/project';

const getAllProjects = async (req: Request, res: Response) => {
  const projects = await getProjects();
  res.json(projects);
};

const initProject = async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const authorId = req.params.userId;
    if (user?.userId !== Number(authorId)) return res.status(401).json({ errorMessage: 'Unauthorized.' });
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
    res.status(500).json({ error, errorMessage: 'Failed to init new project.' });
  }
};

export { getAllProjects, initProject };
