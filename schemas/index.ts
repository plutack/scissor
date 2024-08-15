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
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters long",
        path: ["password"],
      });
    }
    if (!/[a-z]/.test(data.password)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one lowercase letter",
        path: ["password"],
      });
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one uppercase letter",
        path: ["password"],
      });
    }
    if (!/\d/.test(data.password)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one number",
        path: ["password"],
      });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(data.password)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one special character",
        path: ["password"],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }
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