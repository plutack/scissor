import { z, ZodObject } from "zod";
import ErrorWithStatus from "@/Exception/custom-error";

export const validateWithSchema = async <T extends ZodObject<any>>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> => {
  const body = await request.json();
  const validatedFields = schema.safeParse(body);
  if (!validatedFields.success) {
    throw new ErrorWithStatus("Invalid fields", 400);
  }
  return validatedFields.data;
};
