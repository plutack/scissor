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
