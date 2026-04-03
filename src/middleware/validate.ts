import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        error: 'Validation failed',
        issues: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(422).json({
        error: 'Invalid query parameters',
        issues: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.query = result.data as Record<string, string>;
    next();
  };
}
