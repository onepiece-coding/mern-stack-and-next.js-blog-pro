import type { RequestHandler } from 'express';
import createError from 'http-errors';
import { z } from 'zod';
import mongoose from 'mongoose';

const validateObjectIdParam = (paramName: string): RequestHandler => {
  const schema = z.object({
    [paramName]: z
      .string()
      .min(1, { message: `Invalid ${paramName}` })
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: `Invalid ${paramName}`,
      }),
  } as Record<string, any>);

  return (req, _res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return next(
        createError(400, `Invalid parameter: ${firstIssue.message}`, {
          errors: z.treeifyError(parsed.error),
        }),
      );
    }
    return next();
  };
};

export default validateObjectIdParam;
