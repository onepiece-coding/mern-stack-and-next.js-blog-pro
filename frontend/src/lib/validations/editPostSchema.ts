import z from "zod";

const editPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Post Title must be at least 2 characters!" })
    .max(200, { message: "must less than 200 characters!" }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Post Description must be at least 10 characters!" }),
  category: z.string().trim(),
});

type TEditPostFormInputs = z.infer<typeof editPostSchema>;

export { editPostSchema, type TEditPostFormInputs };
