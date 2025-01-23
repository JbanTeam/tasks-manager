import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getUsers, createUser, userByEmail, userById } from '../db/user';
import { JWT_SECRET } from '../constants';

const getAllUsers = async (req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
};

const signUp = async (req: Request, res: Response) => {
  // TODO: add validation
  try {
    const { name, email, password } = req.body;
    const existingUser = await userByEmail(email);
    if (existingUser) return res.status(409).json({ errorMessage: 'User already exists.' });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ name, email, password: hashedPassword });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      userId: newUser.id,
      token,
    });
  } catch (error) {
    console.error('Failed to sign up:', error);
    res.status(500).json({ error, errorMessage: 'Failed to sign up.' });
  }
};

const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userByEmail(email);
    if (!user) return res.status(404).json({ errorMessage: 'User not found. Please provide a valid user email.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ errorMessage: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      userId: user.id,
      token,
    });
  } catch (error) {
    console.error('Failed to sign in:', error);
    res.status(500).json({ error, errorMessage: 'Failed to sign in.' });
  }
};

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userById(Number(id));
  if (!user) return res.status(404).json({ errorMessage: 'User not found. Please provide a valid user ID.' });
  res.json(user);
};

export { getAllUsers, signUp, signIn, getUser };
