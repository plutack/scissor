import ErrorWithStatus from "@/Exception/custom-error";
import { db } from "@/lib/db";
import { shortenLinkSchema, changeCustomSuffixSchema } from "@/schemas";
import { z } from "zod";
import isCustomSuffixInUse from "@/utils/check-custom-suffix";

export const getAllLinks = async (url: URL, userId: string) => {
  // Parse pagination parameters from query string
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    25,
    Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)),
  );
  const name = url.searchParams.get("name") || "";

  const skip = (page - 1) * limit;

  // Prepare the where clause
  const whereClause: any = { userId };
  if (name) {
    whereClause.name = {
      contains: name,
      mode: "insensitive", // Case-insensitive search
    };
  }

  try {
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

    return {
      success: true,
      data: links,
      pagination: {
        page,
        limit,
        totalLinks,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Failed to fetch links:", error);
    throw new ErrorWithStatus("Failed to fetch links", 500);
  }
};

export const createLink = async (
  body: z.infer<typeof shortenLinkSchema>,
  userId: string | undefined,
  customSuffix: string,
) => {
  try {
    const data = await db.link.create({
      data: {
        name: body.name,
        link: body.link,
        customSuffix,
        userId,
      },
    });
    console.log(data);
    return { success: true, data };
  } catch (error) {
    throw new ErrorWithStatus("Failed to create link", 500);
  }
};

export const getLink = async (linkId: string, userId: string | undefined) => {
  try {
    const link = await db.link.findUnique({
      where: {
        id: linkId,
        OR: [{ userId }, { userId: null }],
      },
    });
    if (!link) {
      throw new ErrorWithStatus("Link not found", 404);
    }
    return link;
  } catch (error) {
    throw new ErrorWithStatus("Failed to fetch link", 500);
  }
};

export const getLinkByCustomSuffix = async (customSuffix: string) =>
  await db.link.findUnique({
    where: {
      customSuffix,
    },
  });

export const updateLink = async (
  linkId: string,
  userId: string,
  body: z.infer<typeof changeCustomSuffixSchema>,
) => {
  const { customSuffix } = body;

  const isExisting = await isCustomSuffixInUse(customSuffix);

  if (isExisting) {
    throw new ErrorWithStatus("custom suffix in use", 409);
  }

  await db.link.update({
    where: {
      id: linkId,
      userId,
    },
    data: {
      customSuffix,
    },
  });
};

export const getUserTopCountries = async (userId: string) => {
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
  return formattedData;
};

export const updateDbOnLinkClick = async (
  customSuffix: string,
  country: string,
) => {
  await db.$transaction(async (tx) => {
    // Update link click count
    const updatedLink = await tx.link.update({
      where: { customSuffix },
      data: { clicks: { increment: 1 } },
      include: { user: true },
    });

    if (updatedLink.userId) {
      // Check if this country has been visited before for any of the user's links
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

    return { updatedLink, updatedVisit };
  });
};

export const getLinkStats = async (linkId: string, userId: string) => {
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

  // Calculate percentage of visits for each country
  const countryStats = visits.map((visit) => ({
    country: visit.country,
    count: visit.count,
    percentage: ((visit.count / totalVisits) * 100).toFixed(2),
  }));

  return {
    link,
    totalVisits,
    uniqueCountriesCount: uniqueCountries.size,
    top5Countries,
    countryStats,
  };
};
