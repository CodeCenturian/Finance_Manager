import { RequestHandler } from 'express';
import * as usersService from '../services/users.service';
import { UpdateMeInput, AdminUpdateUserInput } from '../schemas/user.schema';

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const user = await usersService.getMe(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateMe: RequestHandler = async (req, res, next) => {
  try {
    const user = await usersService.updateMe(req.user!.userId, req.body as UpdateMeInput);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const listUsers: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await usersService.listUsers(page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(parseInt(req.params.id));
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const adminUpdateUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await usersService.adminUpdateUser(
      parseInt(req.params.id),
      req.user!.userId,
      req.body as AdminUpdateUserInput,
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    await usersService.softDeleteUser(parseInt(req.params.id), req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
