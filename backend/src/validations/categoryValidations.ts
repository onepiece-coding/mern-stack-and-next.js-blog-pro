import { z } from "zod";

// Validate Create Category
export const validateCreateCategory= z.object({
  title: z.string().trim().describe("Title"),
});