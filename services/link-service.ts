import ErrorWithStatus from "@/exception/custom-error";
import { db } from "@/lib/db";
import { shortenLinkSchema, changeCustomSuffixSchema } from "@/schemas";
import { z } from "zod";
import isCustomSuffixInUse from "@/utils/check-custom-suffix";
import logger from "@/lib/logger";
import { getRedisValue, setRedisValue, redis } from "@/lib/redis";

const log = logger.child({ service: "link-service" });

const CACHE_TTL = 3600; // time is in seconds so 1hr

export const getAllLinks = async (url: URL, userId: string) => {
  log.info("Fetching all links called");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    25,
    Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)),
  );
  const name = url.searchParams.get("name") || "";

  const cacheKey = `allLinks:${userId}:${page}:${limit}:${name}`;

  try {
    // Try to get data from cache
    const cachedData = await getRedisValue<any>(cacheKey);
    if (cachedData) {
      log.info(`All links found in cache for userId: ${userId}`);
      return cachedData;
    }

    const skip = (page - 1) * limit;

    // Prepare the where clause
    const whereClause: any = { userId };
    if (name) {
      whereClause.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    // Fetch paginated links with optional name filter
    const links = await db.link.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count total number of links for pagination metadata
    const totalLinks = await db.link.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalLinks / limit);

    const result = {
      data: links,
      pagination: {
        page,
        limit,
        totalLinks,
        totalPages,
      },
    };

    // Store in cache
    await setRedisValue(cacheKey, result, CACHE_TTL);

    return result;
  } catch (error) {
    log.error(`Error fetching all links: ${error}`);
    throw new ErrorWithStatus("Failed to fetch links", 500);
  }
};

export const createLink = async (
  body: z.infer<typeof shortenLinkSchema>,
  userId: string | undefined,
  customSuffix: string,
) => {
  try {
    log.info("Creating link called");
    const data = await db.link.create({
      data: {
        name: body.name,
        link: body.link,
        customSuffix,
        userId,
      },
    });

    // Invalidate cache for getAllLinks
    const cacheKeyPrefix = `allLinks:${userId}`;
    const keys = await redis.keys(`${cacheKeyPrefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // Cache the new link
    const cacheKey = `link:${customSuffix}`;
    await setRedisValue(cacheKey, data, CACHE_TTL);

    return { success: true, data };
  } catch (error) {
    log.error(`Error creating link: ${error}`);
    throw new ErrorWithStatus("Failed to create link", 500);
  }
};

export const getLink = async (linkId: string, userId: string | undefined) => {
  try {
    log.info("Fetching link called");
    const cacheKey = `link:${linkId}`;

    // Try to get data from cache
    const cachedData = await getRedisValue<any>(cacheKey);
    if (cachedData) {
      log.info(`Link found in cache for linkId: ${linkId}`);
      return cachedData;
    }

    const link = await db.link.findUnique({
      where: {
        id: linkId,
        OR: [{ userId }, { userId: null }],
      },
    });
    if (!link) {
      throw new ErrorWithStatus("Link not found", 404);
    }

    // Store in cache
    await setRedisValue(cacheKey, link, CACHE_TTL);

    return link;
  } catch (error) {
    log.error(`Error fetching link: ${error}`);
    throw new ErrorWithStatus("Failed to fetch link", 500);
  }
};

export const getLinkByCustomSuffix = async (customSuffix: string) => {
  log.info(`Fetching link for customSuffix: ${customSuffix}`);
  try {
    const cacheKey = `link:${customSuffix}`;

    // Try to get data from cache
    const cachedData = await getRedisValue<any>(cacheKey);
    if (cachedData) {
      log.info(`Link found in cache for customSuffix: ${customSuffix}`);
      return cachedData;
    }

    log.info(`Link not found in cache for customSuffix: ${customSuffix}, fetching from database`);
    // If not in cache, fetch from database
    const link = await db.link.findUnique({ where: { customSuffix } });
    if (link) {
      log.info(`Link found in database for customSuffix: ${customSuffix}, storing in cache`);
      // Store in cache
      await setRedisValue(cacheKey, link, CACHE_TTL);
      return link;
    } else {
      log.warn(`Link not found for customSuffix: ${customSuffix}`);
      return null;
    }
  } catch (error) {
    log.error(`Error fetching link for customSuffix: ${customSuffix}. Error: ${error}`);
    throw new ErrorWithStatus("Failed to fetch link", 500);
  }
};

export const updateLink = async (
  linkId: string,
  userId: string,
  body: z.infer<typeof changeCustomSuffixSchema>,
) => {
  try {
    log.info("Updating link called");
    const { customSuffix } = body;

    const isExisting = await isCustomSuffixInUse(customSuffix);

    if (isExisting) {
      throw new ErrorWithStatus("custom suffix in use", 409);
    }

    const updatedLink = await db.link.update({
      where: {
        id: linkId,
        userId,
      },
      data: {
        customSuffix,
      },
    });

    // Update cache
    const cacheKey = `link:${customSuffix}`;
    await setRedisValue(cacheKey, updatedLink, CACHE_TTL);

    // Invalidate cache for getAllLinks
    const cacheKeyPrefix = `allLinks:${userId}`;
    const keys = await redis.keys(`${cacheKeyPrefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // Invalidate cache for the old custom suffix
    const oldLinkCacheKey = `link:${linkId}`;
    await redis.del(oldLinkCacheKey);

  } catch (error) {
    log.error(`Error updating link: ${error}`);
    throw new ErrorWithStatus("Failed to update link", 500);
  }
};

export const getUserTopCountries = async (userId: string) => {
  try {
    log.info("Fetching top countries called");
    const cacheKey = `topCountries:${userId}`;

    // Try to get data from cache
    const cachedData = await getRedisValue<any>(cacheKey);
    if (cachedData) {
      log.info(`Top countries found in cache for userId: ${userId}`);
      return cachedData;
    }

    const topCountries = await db.visit.groupBy({
      by: ["country"],
      where: {
        link: {
          userId,
        },
      },
      _sum: {
        count: true,
      },
      orderBy: {
        _sum: {
          count: "desc",
        },
      },
    });

    const formattedData = topCountries.map((country) => ({
      country: country.country,
      clicks: country._sum.count || 0,
    }));

    // Store in cache
    await setRedisValue(cacheKey, formattedData, CACHE_TTL);

    return formattedData;
  } catch (error) {
    log.error(`Error fetching top countries: ${error}`);
    throw new ErrorWithStatus("Failed to fetch top countries", 500);
  }
};

export const updateDbOnLinkClick = async (
  customSuffix: string,
  country: string,
) => {
  try {
    log.info("Updating database on link click called");
    await db.$transaction(async (tx) => {
      // Update link click count
      const updatedLink = await tx.link.update({
        where: { customSuffix },
        data: { clicks: { increment: 1 } },
        include: { user: true },
      });

      if (updatedLink.userId) {
        const existingVisit = await tx.visit.findFirst({
          where: {
            link: { userId: updatedLink.userId },
            country,
          },
        });

        // Update user stats
        await tx.user.update({
          where: { id: updatedLink.userId },
          data: {
            totalClicks: { increment: 1 },
            uniqueCountryCount: {
              increment: existingVisit ? 0 : 1,
            },
          },
        });
      }

      // Upsert visit entry
      const updatedVisit = await tx.visit.upsert({
        where: { linkId_country: { linkId: updatedLink.id, country } },
        create: { linkId: updatedLink.id, country, count: 1 },
        update: { count: { increment: 1 } },
      });

      // Update cache
      const linkCacheKey = `link:${customSuffix}`;
      await setRedisValue(linkCacheKey, updatedLink, CACHE_TTL);

      // Invalidate user top countries cache
      if (updatedLink.userId) {
        const topCountriesCacheKey = `topCountries:${updatedLink.userId}`;
        await redis.del(topCountriesCacheKey);
      }

      return { updatedLink, updatedVisit };
    });
  } catch (error) {
    log.error(`Error updating database on link click: ${error}`);
    throw new ErrorWithStatus("Failed to update database on link click", 500);
  }
};

export const getLinkStats = async (linkId: string, userId: string) => {
  const cacheKey = `linkStats:${linkId}`;

  try {
    // Try to get data from cache
    const cachedData = await getRedisValue<any>(cacheKey);
    if (cachedData) {
      log.info(`Link stats found in cache for linkId: ${linkId}`);
      return cachedData;
    }

    const link = await db.link.findUnique({
      where: {
        id: linkId,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        customSuffix: true,
        createdAt: true,
        updatedAt: true,
        clicks: true,
      },
    });

    if (!link) {
      throw new ErrorWithStatus("Link not found", 404);
    }

    const visits = await db.visit.findMany({
      where: {
        linkId,
      },
      orderBy: {
        count: "desc",
      },
    });

    const totalVisits = visits.reduce((acc, visit) => acc + visit.count, 0);
    const uniqueCountries = new Set(visits.map((visit) => visit.country));
    const top5Countries = visits
      .slice(0, 5)
      .map(({ country, count }) => ({ country, clickCount: count }));
    const countryStats = visits.map((visit) => ({
      country: visit.country,
      count: visit.count,
      percentage: ((visit.count / totalVisits) * 100).toFixed(2),
    }));

    const result = {
      link,
      totalVisits,
      uniqueCountriesCount: uniqueCountries.size,
      top5Countries,
      countryStats,
    };

    // Store in cache
    await setRedisValue(cacheKey, result, CACHE_TTL);

    return result;
  } catch (error) {
    log.error(`Error fetching link stats: ${error}`);
    if (error instanceof ErrorWithStatus) {
      throw error;
    }
    throw new ErrorWithStatus("Failed to fetch link stats", 500);
  }
};