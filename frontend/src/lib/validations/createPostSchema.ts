import z from "zod";

// Updated createPostSchema.ts
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Post Title must be at least 2 characters!" })
    .max(200, { message: "must less than 200 characters!" }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Post Description must be at least 10 characters!" }),
  category: z.string().trim().min(1, { message: "Category is required!" }),
  image: z
    .any()
    .refine((file) => file?.length > 0, "Image is required!")
    .refine((file) => file?.[0]?.size <= MAX_FILE_SIZE, "Max image size is 1MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type),
      "Only .jpg, .png, .webp formats are supported"
    ),
});

type TCreatePostFormInputs = z.infer<
  typeof createPostSchema & { image: object }
>;

export { createPostSchema, type TCreatePostFormInputs };
