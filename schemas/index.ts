import * as z from "zod";

const urlRegex =
  /^((?:ftp|http|https)?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

export const loginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }), // TODO: Enforce strong password
    confirmPassword: z.string().min(1, { message: "Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const shortenLinkSchema = z.object({
  name: z.string().max(10, { message: "Name is too long" }).optional(),
  link: z.string().regex(urlRegex, { message: "Invalid URL" }),
  customSuffix: z
    .string()
    .min(3, { message: "Custom suffix is too short" })
    .optional()
    .or(z.undefined()),
});

export const changeCustomSuffixSchema = z.object({
  customSuffix: z.string().min(3, { message: "Custom suffix is too short" }),
});
