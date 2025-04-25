import z from "zod";

const editProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, { message: "Username must be at least 2 characters!" })
    .max(100, { message: "Username must be less than 100 characters!" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters!" })
    .regex(/.*[!@#$%^&*()_+{}|[\]\\:";'<>?,./].*/, {
      message: "Password should contain at least 1 special character!",
    })
    .optional()
    .or(z.literal("")),
  bio: z.string().optional(),
});

type TEditProfileFormInputs = z.infer<typeof editProfileSchema>;

export { editProfileSchema, type TEditProfileFormInputs };
