import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

import { JWT_REFRESH_SECRET, JWT_SECRET } from '@src/constants';
import { DecodedUser } from '@src/types/reqTypes';

function generateTokens(user: User): { accessToken: string; refreshToken: string } {
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ userId: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7 days' });

  return { accessToken, refreshToken };
}

function generateAccessToken(user: User): string {
  const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '5m' });

  return accessToken;
}

function verifyRefreshToken(refreshToken: string): DecodedUser {
  const decodedUser: DecodedUser = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as DecodedUser;
  return decodedUser;
}

export { generateTokens, generateAccessToken, verifyRefreshToken };
