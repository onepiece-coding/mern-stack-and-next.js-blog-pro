import { Request, Response, NextFunction } from 'express';

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  // @ts-ignore: attach statusCode for errorHandler
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode ?? 500;
  const response: Record<string, any> = { message: err.message };
  if (err.errors) response.errors = err.errors; // <-- include zod details
  if (process.env.NODE_ENV !== 'production') response.stack = err.stack;
  res.status(status).json(response);
};