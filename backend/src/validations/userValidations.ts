import { z } from 'zod';
import { sanitizeText } from '../utils/sanitize.js';

export const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character');

// Validate Register User
export const validateRegisterUser = z.object({
  username: z.preprocess(
    sanitizeText,
    z
      .string()
      .trim()
      .min(2, 'Username too short')
      .max(100, 'Username too long'),
  ),
  email: z.preprocess(
    sanitizeText,
    z
      .email('Invalid email')
      .trim()
      .min(5, 'Email too short')
      .max(100, 'Email too long'),
  ),
  password: passwordSchema,
});

// Validate Login User
export const validateLoginUser = z.object({
  email: z.preprocess(
    sanitizeText,
    z.email('Invalid email').min(1, 'Email required').trim(),
  ),
  password: z.string().trim().min(1, 'Password required'),
});

// Validate Email
export const validateEmail = z.object({
  email: z.preprocess(
    sanitizeText,
    z.email('Invalid email').trim().min(1, 'Email required'),
  ),
});

// Validate New Password
export const validateNewPassword = z.object({
  password: passwordSchema,
});

// Validate Update User
export const validateUpdateUser = z.object({
  username: z.preprocess(
    sanitizeText,
    z.string().trim().min(2).max(100).optional(),
  ),
  password: passwordSchema.optional(),
  bio: z.preprocess(sanitizeText, z.string().optional()),
});

export type RegisterUserInput = z.infer<typeof validateRegisterUser>;
export type LoginUserInput = z.infer<typeof validateLoginUser>;
export type UpdateUserInput = z.infer<typeof validateUpdateUser>;
