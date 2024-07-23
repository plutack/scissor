import { db } from "@/lib/db";

export const FindUserByEmail = async (email: string) => {
  try {
    await db.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
};
export const FindUserById = async (id: string) => {
  try {
    await db.user.findUnique({ where: { id } });
  } catch {
    return null;
  }
};
