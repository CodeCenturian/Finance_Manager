import { RequestHandler } from 'express';
import * as dashService from '../services/dashboard.service';
import {
  DashboardFilterSchema,
  TrendQuerySchema,
  RecentQuerySchema,
} from '../schemas/dashboard.schema';

export const getSummary: RequestHandler = async (req, res, next) => {
  try {
    const filters = DashboardFilterSchema.parse(req.query);
    const result = await dashService.getSummary(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCategoryBreakdown: RequestHandler = async (req, res, next) => {
  try {
    const filters = DashboardFilterSchema.parse(req.query);
    const result = await dashService.getCategoryBreakdown(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMonthlyTrends: RequestHandler = async (req, res, next) => {
  try {
    const { periods } = TrendQuerySchema.parse(req.query);
    const result = await dashService.getMonthlyTrends(periods);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getWeeklyTrends: RequestHandler = async (req, res, next) => {
  try {
    const { periods } = TrendQuerySchema.parse(req.query);
    const result = await dashService.getWeeklyTrends(periods);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getRecentTransactions: RequestHandler = async (req, res, next) => {
  try {
    const { limit } = RecentQuerySchema.parse(req.query);
    const result = await dashService.getRecentTransactions(limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
