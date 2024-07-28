import { RegisterSchema } from "@/schemas";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { findUserByEmail } from "@/data/user";
import ky, { HTTPError } from "ky";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  try {
    const data = await ky
      .post("/api/auth/register", {
        json: values,
      })
      .json();

    return data;
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof HTTPError) {
      // ky throws HTTPError for non-2xx responses
      const errorData = await error.response.json();
      return { error: errorData.error || "An error occurred" };
    } else if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unexpected error occurred" };
    }
  }
};
