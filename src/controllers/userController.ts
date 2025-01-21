import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getUsers, createUser, getUserByEmail, usersCount, getUserById } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';

const getAllUsers = async (req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
};

const getUsersCount = async (req: Request, res: Response) => {
  const count = await usersCount();
  res.json(count);
};

const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ name, email, password: hashedPassword });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error('Failed to sign up:', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
};

const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Failed to sign in:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
};

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(Number(id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export { getAllUsers, signUp, signIn, getUser, getUsersCount };
