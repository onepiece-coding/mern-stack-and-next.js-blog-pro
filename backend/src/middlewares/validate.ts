import { ZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { formatZodError } from '../utils/zodHelper.js';

export const validate =
  (schema: ZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (result.success) return next();

    const errors = formatZodError(result.error);
    const err = createError(400, 'Validation failed');
    // attach extra info that your errorHandler can include in response
    // @ts-ignore
    err.errors = errors;
    return next(err);
  };