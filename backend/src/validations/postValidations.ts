import { z } from 'zod';
import mongoose from 'mongoose';
import { sanitizeText } from '../utils/sanitize.js';

// Validate Create Post
export const validateCreatePost = z.object({
  title: z.preprocess(sanitizeText, z.string().trim().min(2).max(200)),
  description: z.preprocess(sanitizeText, z.string().trim().min(10)),
  categoryId: z
    .string()
    .trim()
    .refine((v) => mongoose.Types.ObjectId.isValid(v), {
      message: 'Invalid categoryId',
    }),
});

// Validate Update Post
export const validateUpdatePost = z.object({
  title: z.preprocess(
    sanitizeText,
    z.string().trim().min(2).max(200).optional(),
  ),
  description: z.preprocess(sanitizeText, z.string().trim().min(10).optional()),
  categoryId: z
    .string()
    .trim()
    .optional()
    .refine((v) => (v ? mongoose.Types.ObjectId.isValid(v) : true), {
      message: 'Invalid categoryId',
    }),
});
