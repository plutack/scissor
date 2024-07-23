import { db } from "@/lib/db";

export const findUserByEmail = async (email: string) => {
  try {
    return await db.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
};
export const findUserById = async (id: string) => {
  try {
    return await db.user.findUnique({ where: { id } });
  } catch {
    return null;
  }
};
