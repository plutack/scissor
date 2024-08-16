import ErrorWithStatus from "@/exception/custom-error";
import { db } from "@/lib/db";
import { getRedisValue, setRedisValue } from "@/lib/redis";
import { User } from "@prisma/client";
import logger from "@/lib/logger";
import { redis } from "@/lib/redis";

const log = logger.child({
  service: "user-service",
});

const CACHE_TTL = 3600; // 1 hour in seconds

// Add this function to invalidate user-related caches
export async function invalidateUserCaches(userId: string) {
  log.info({ userId }, `Invalidating user caches for userId`);
  const keys = await redis.keys(`user:${userId}*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export const getUserStats = async (userId: string) => {
  log.info(`Fetching user stats called for userId: ${userId}`);
  try {
    const cacheKey = `user:${userId}:stats`;

    // Try to get data from cache
    const cachedData = await getRedisValue<any>(cacheKey);
    if (cachedData) {
      log.info(`User stats found in cache for userId: ${userId}`);
      return cachedData;
    } else {
      log.info(`User stats not found in cache for userId: ${userId}`);
    }

    // If not in cache, fetch from database
    log.info(`Fetching user stats from database for userId: ${userId}`);
    const data = await db.user.findUnique({
      where: { id: userId },
    });
    if (!data) {
      log.warn(`User not found in database for ID: ${userId}`);
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

    // Store in cache
    log.info(`Storing user stats in cache for userId: ${userId}`);
    await setRedisValue(cacheKey, stats, CACHE_TTL);

    // Invalidate other user-related caches
    await invalidateUserCaches(userId);

    return stats;
  } catch (error) {
    log.error(
      `Error fetching user stats for userId: ${userId}. Error: ${error}`,
    );
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
    const cacheKey = `user:${email}`;

    // Try to get data from cache
    const cachedData = await getRedisValue<User>(cacheKey);
    if (cachedData) {
      log.info(`User found in cache for email: ${email}`);
      return cachedData;
    }

    // If not in cache, fetch from database
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      // Store in cache
      await setRedisValue(cacheKey, user, CACHE_TTL);
    }
    return user;
  } catch (error) {
    log.error(`Error fetching user by email: ${email}. Error: ${error}`);
    return null;
  }
};

export const sanitizeUser = async (
  email: string,
): Promise<Omit<User, "password" | "image"> | null> => {
  log.info("Sanitizing user called");
  const userData = await getUserByEmail(email);

  if (!userData) {
    return null;
  }

  const { password, image, ...user } = userData;
  return user;
};
