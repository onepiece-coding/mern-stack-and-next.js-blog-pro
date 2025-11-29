import { z } from "zod";

// Validate Create Post
export const validateCreatePost = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10),
  category: z.string().trim()
})

// Validate Update Post
export const validateUpdatePost = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(10).optional(),
  category: z.string().trim().optional(),
})
