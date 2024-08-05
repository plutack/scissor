import { loginSchema } from "@/schemas";
import { z } from "zod";
import ky, { HTTPError } from "ky";

interface ErrorMessage {
  error?: string;
}

export const login = async (
  values: z.infer<typeof loginSchema>,
): Promise<ErrorMessage> => {
  try {
    const data = await ky
      .post("/api/auth/login", {
        json: values,
      })
      .json();

    return {};
  } catch (error) {
    if (error instanceof HTTPError) {
      // ky throws HTTPError for non-2xx responses
      const errorData = await error.response.json();
      return { error: errorData.error || "An error occurred" };
    }
    return { error: "An unexpected error occurred" };
  }
};
