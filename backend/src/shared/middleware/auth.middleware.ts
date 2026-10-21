import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { Role } from '../../config/roles';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedUser } from '../types/express';

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export const authenticateJwt = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ApiResponse.error(res, 'Authentication token missing or invalid', 401, 'Unauthorized');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user: AuthenticatedUser = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    req.user = user;
    next();
  } catch (error) {
    ApiResponse.error(res, 'Token has expired or is invalid', 401, 'Unauthorized');
  }
};

export const optionalAuthenticateJwt = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user: AuthenticatedUser = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    req.user = user;
  } catch (error) {
    // Soft ignore invalid/expired token for optional auth, user remains undefined
  }
  next();
};
