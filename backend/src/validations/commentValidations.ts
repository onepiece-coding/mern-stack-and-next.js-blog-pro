import { z } from 'zod';
import mongoose from 'mongoose';
import { sanitizeText } from '../utils/sanitize.js';

// Validate Create Comment
export const validateCreateComment = z.object({
  postId: z
    .string()
    .describe('Post Id')
    .refine((v) => mongoose.Types.ObjectId.isValid(v), {
      message: 'Invalid postId',
    }),
  text: z.preprocess(sanitizeText, z.string().trim().describe('Text')),
});

// Validate Update Comment
export const validateUpdateComment = z.object({
  text: z.preprocess(sanitizeText, z.string().trim()),
});
