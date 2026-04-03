import { RequestHandler } from 'express';
import { Role } from '../types';

export function requireRoles(...roles: Role[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
      return;
    }
    next();
  };
}
