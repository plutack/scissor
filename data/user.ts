import { db } from "@/lib/db";
// TODO: move to user-service
export const findUserByEmail = async (email: string) => {
  try {
    return await db.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
};

