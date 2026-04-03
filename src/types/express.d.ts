import { Role } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: Role;
      };
    }
  }
}
