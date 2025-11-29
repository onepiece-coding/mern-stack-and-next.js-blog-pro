import { z } from "zod";

// Validate Create Comment
export const validateCreateComment = z.object({
  postId: z.string().describe("Post Id"),
  text: z.string().trim().describe("Text")
});

// Validate Update Comment
export const validateUpdateComment =z.object({
    text: z.string().trim()
});