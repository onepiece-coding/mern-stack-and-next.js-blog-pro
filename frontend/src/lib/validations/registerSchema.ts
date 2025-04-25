import z from "zod";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, { message: "Username must be at least 2 characters!" })
    .max(100, { message: "Username must less than 100 characters!" }),
  email: z
    .string()
    .trim()
    .min(5, { message: "Email must be at least 5 characters!" })
    .max(100, { message: "Email must less than 100 characters!" })
    .email(),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters!" })
    .regex(/.*[!@#$%^&*()_+{}|[\]\\:";'<>?,./].*/, {
      message: "Password should contain at least 1 special character!",
    }),
});

type TRegisterFormInputs = z.infer<typeof registerSchema>;

export { registerSchema, type TRegisterFormInputs };
