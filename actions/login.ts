"use server";
import { LoginSchema } from "@/schemas";
import * as z from "zod";
export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  console.log(validatedFields);
  if (!validatedFields.success) {
    return { error: "invalid fields" };
  }
  return { success: "Email sent" };
};
