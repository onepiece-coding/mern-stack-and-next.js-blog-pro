import type { Request, Response, NextFunction, RequestHandler } from 'express';
import createError from 'http-errors';
import { z } from 'zod';
import mongoose from 'mongoose';

export const validateObjectIdParam = (paramName: string): RequestHandler => {
  const shape: Record<string, any> = {
    [paramName]: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: `Invalid ${paramName}`
      })
  };

  const schema = z.object(shape);

  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return next(
        createError(400, `Invalid parameter: ${first.message}`, {
          errors: z.treeifyError(parsed.error)
        })
      );
    }
    return next();
  };
};

export default validateObjectIdParam;