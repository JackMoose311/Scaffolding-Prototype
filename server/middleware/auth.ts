import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = user.userId;
    next();
  });
}
