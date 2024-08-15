import { registerSchema } from "@/schemas";
import { z } from "zod";
import ky, { HTTPError } from "ky";
import logger from "@/lib/logger";

const log = logger.child({ action: "Register" });

interface ErrorMessage {
  success?: string;
  error?: string;
}

export const register = async (
  values: z.infer<typeof registerSchema>,
): Promise<ErrorMessage> => {
  log.info("Registering user");
  try {
    await ky
      .post("/api/auth/register", {
        json: values,
      })
      .json();

    return { success: "Verification message sent" };
  } catch (error) {
    log.error("Register error:", error);
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
