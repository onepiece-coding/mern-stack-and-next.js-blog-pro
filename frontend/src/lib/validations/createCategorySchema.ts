import z from "zod";

const createCategorySchema = z.object({
  category: z.string().trim().min(1, { message: "Category is required!" }),
});

type TCreateCategoryFormInput = z.infer<
  typeof createCategorySchema & { image: object }
>;

export { createCategorySchema, type TCreateCategoryFormInput };
