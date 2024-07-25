import { LoginSchema } from "@/schemas";
import * as z from "zod";
import ky, { HTTPError } from "ky";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const data = await ky
      .post("/api/auth/login", {
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
