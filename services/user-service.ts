import ErrorWithStatus from "@/exception/custom-error";
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import logger from "@/lib/logger";

const log = logger.child({
  service: "user-service",
});

export const getUserStats = async (userId: string) => {
  log.info("Fetching user stats called");
  try {
    const data = await db.user.findUnique({
      where: { id: userId },
    });
    if (!data) {
      throw new ErrorWithStatus("User not found", 404);
    }
    const { id, email, name } = data;

    const totalLinksCreated = await db.link.count({
      where: { userId },
    });

    // Total unique links across all links created by the user
    const uniqueLinksCount = await db.link
      .findMany({
        where: { userId },
        distinct: ["link"],
        select: {
          link: true,
        },
      })
      .then((links) => links.length);

    // Last 5 links created by the user
    const lastFiveLinks = await db.link.findMany({
      where: { userId },
      select: {
        link: true,
        customSuffix: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Top 5 countries by click count across all links
    const topCountries = await db.visit.findMany({
      where: {
        link: {
          userId,
        },
      },
      select: {
        country: true,
        count: true,
      },
      orderBy: {
        count: "desc",
      },
      take: 5,
    });

    const stats = {
      userId: id,
      email,
      name,
      totalLinksCreated,
      uniqueLinksCount,
      lastFiveLinks,
      topCountries: topCountries.map(({ country, count }) => ({
        country,
        clickCount: count,
      })),
    };

    return stats;
  } catch (error) {
    log.error("Error fetching user stats:", error);
    if (error instanceof ErrorWithStatus) {
      throw error;
    }
    throw new ErrorWithStatus(
      "An error occurred while fetching user stats",
      500,
    );
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    return await db.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
};

export const sanitizeUser = async (
  email: string,
): Promise<Omit<User, "password" | "image"> | null> => {
  log.info("Sanitizing user called");
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
