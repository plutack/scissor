import { z, ZodObject } from "zod";
import ErrorWithStatus from "@/exception/custom-error";
import logger from "@/lib/logger";

const log = logger.child({ util: "Validate-request" });

export const validateWithSchema = async <T extends ZodObject<any>>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> => {
  const body = await request.json();
  log.info("Validating request");
  const validatedFields = schema.safeParse(body);
  if (!validatedFields.success) {
    throw new ErrorWithStatus("Invalid fields", 400);
  }
  return validatedFields.data;
};
