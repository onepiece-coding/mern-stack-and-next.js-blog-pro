import { ZodError } from 'zod';

export const formatZodError = (err: ZodError) => {
  return err.issues.map((e) => ({
    path: e.path.length ? e.path.join('.') : '(root)',
    message: e.message,
  }));
};
