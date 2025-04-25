import z from "zod";

const loginSchema = z.object({
  email: z.string().trim().min(1, { message: "Email is required!" }).email(),
  password: z.string().trim().min(1, { message: "Password is required!" }),
});

type TLoginFormInputs = z.infer<typeof loginSchema>;

export { loginSchema, type TLoginFormInputs };
