import { RequestHandler } from 'express';
import { Role } from '../types';
import * as authService from '../services/auth.service';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export const register: RequestHandler = async (req, res, next) => {
  try {
    const requestingRole = req.user?.role as Role | undefined;
    const user = await authService.registerUser(req.body as RegisterInput, requestingRole);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body as LoginInput);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
