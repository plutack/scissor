import { registerSchema } from "@/schemas";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import ky, { HTTPError } from "ky";

interface ErrorMessage {
  success?: string;
  error?: string;
}

export const register = async (
  values: z.infer<typeof registerSchema>,
): Promise<ErrorMessage> => {
  try {
    const data = await ky
      .post("/api/auth/register", {
        json: values,
      })
      .json();

    return { success: "Verification message sent" };
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
