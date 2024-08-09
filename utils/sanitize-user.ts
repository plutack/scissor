// utils/sanitizeUser.ts
import { PrismaClient } from "@prisma/client";
import { User } from "@prisma/client";

const prisma = new PrismaClient();
// TODO move to user service function  and rename
const sanitizeUser = async (
  email: string,
): Promise<Omit<User, "password" | "image"> | null> => {
  const userData = await prisma.user.findUnique({
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
