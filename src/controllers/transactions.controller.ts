import { RequestHandler } from 'express';
import * as txService from '../services/transactions.service';
import {
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionFilterSchema,
} from '../schemas/transaction.schema';

export const createTransaction: RequestHandler = async (req, res, next) => {
  try {
    const transaction = await txService.createTransaction(
      req.body as TransactionCreateInput,
      req.user!.userId,
    );
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

export const listTransactions: RequestHandler = async (req, res, next) => {
  try {
    const filters = TransactionFilterSchema.parse(req.query);
    const result = await txService.listTransactions(filters, req.user!.userId, req.user!.role);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTransaction: RequestHandler = async (req, res, next) => {
  try {
    const transaction = await txService.getTransactionById(
      parseInt(req.params.id),
      req.user!.userId,
      req.user!.role,
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

export const updateTransaction: RequestHandler = async (req, res, next) => {
  try {
    const transaction = await txService.updateTransaction(
      parseInt(req.params.id),
      req.body as TransactionUpdateInput,
      req.user!.userId,
      req.user!.role,
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction: RequestHandler = async (req, res, next) => {
  try {
    await txService.softDeleteTransaction(
      parseInt(req.params.id),
      req.user!.userId,
      req.user!.role,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
