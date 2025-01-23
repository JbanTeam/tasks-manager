import { Request, Response } from 'express';
import { assignTask, createTask } from '../db/task';
import { checkUserRightsForProject } from '../db/project';
import { userById } from '../db/user';

const initTask = async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const { title, description, deadline } = req.body;
    const { projectId } = req.params;

    if (!user) return res.status(401).json({ errorMessage: 'Unauthorized.' });

    if (!title || !deadline) {
      return res.status(400).json({ errorMessage: 'Title and deadline are required.' });
    }

    const ownProject = await checkUserRightsForProject(Number(projectId), user.userId);

    if (!ownProject) return res.status(401).json({ errorMessage: 'You are not the owner of this project.' });

    await createTask({ title, description, deadline, projectId: Number(projectId) });

    res.status(201).json({
      message: 'Task created successfully.',
    });
  } catch (error) {
    console.error('Failed to init new task:', error);
    res.status(500).json({ error, errorMessage: 'Failed to init new task.' });
  }
};

const assignTaskToUser = async (req: Request, res: Response) => {
  try {
    const { taskId, projectId } = req.params;
    const { performerId } = req.query;
    const { user } = req;

    if (!performerId) return res.status(400).json({ errorMessage: 'Performer ID is required.' });

    if (!user) return res.status(401).json({ errorMessage: 'Unauthorized.' });

    const ownProject = await checkUserRightsForProject(Number(projectId), user.userId);

    if (!ownProject) return res.status(401).json({ errorMessage: 'You are not the owner of this project.' });

    const performer = await userById(Number(performerId));

    if (!performer) return res.status(404).json({ errorMessage: 'Performer is not exists.' });

    await assignTask(Number(taskId), Number(performerId));

    res.status(201).json({
      message: 'Performer assigned successfully.',
    });
  } catch (error) {
    console.error('Failed to assign task:', error);
    res.status(500).json({ error, errorMessage: 'Failed to assign task.' });
  }
};

export { initTask, assignTaskToUser };
