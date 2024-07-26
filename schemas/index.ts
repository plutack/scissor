import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, { message: "First name is required" }),
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const shortenLinkSchema = z.object({
  link: z.string().url({ message: "This is a invalid url" }),
  customSuffix: z
    .string()
    .min(3, { message: "Custom suffix is too short" })
    .optional(),
});
