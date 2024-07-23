"use server";
import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { FindUserByEmail } from "@/data/user";
export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await FindUserByEmail(email);
  if (existingUser) return { error: "email already in use" };
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  return { success: "Email sent" };
};
