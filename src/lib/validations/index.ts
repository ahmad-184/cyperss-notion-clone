import * as z from "zod";

export const loginValidator = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(5, { message: "Password must be morethan 5 characters" })
    .max(20, { message: "Reached to max length" }),
});

export type loginValidatorType = z.infer<typeof loginValidator>;
