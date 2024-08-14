import { db } from "@/lib/db";
import { User } from "@prisma/client";

// TODO move to user service function  and rename
const sanitizeUser = async (
  email: string,
): Promise<Omit<User, "password" | "image"> | null> => {
  const userData = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!userData) {
    return null;
  }

  const { password, image, ...user } = userData;
  return user;
};

export default sanitizeUser;
