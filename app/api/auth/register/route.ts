"use server";
import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { findUserByEmail } from "@/data/user";

// TODO : implement response type in the future

export async function POST(request: Request)  {
  const body = await request.json();
  const validatedFields = RegisterSchema.safeParse(body);
  console.log(validatedFields);
  if (!validatedFields.success) {
    return Response.json({ error: "Invalid fields" }, { status: 400 });
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await findUserByEmail(email);
  if (existingUser) return Response.json({ error: "email already in use" },{status: 409});
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  return Response.json({ success: "Email sent" }, {status: 201});
};
