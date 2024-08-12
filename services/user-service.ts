import ErrorWithStatus from "@/Exception/custom-error";
import { db } from "@/lib/db";

export const getUserStats = async (userId: string) => {
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

    // Prepare the response data
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
    console.error("Error fetching user stats:", error);
    throw new ErrorWithStatus("An error occurred while fetching user stats", 500);
  }
};
