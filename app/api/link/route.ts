import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  const url = new URL(req.url);

  // Parse pagination parameters from query string
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);

  // Reset page and limit if negative or zero
  const validPage = page > 0 ? page : 1;
  const validLimit = limit > 0 && limit <= 25 ? limit : 10;

  const skip = (validPage - 1) * validLimit;

  try {
    // Fetch paginated links
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await db.link.findMany({
      where: {
        userId: session.user.id,
      },
      skip: skip,
      take: validLimit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count total number of links for pagination metadata
    const totalLinks = await db.link.count({
      where: {
        userId: session?.user.id,
      },
    });

    const totalPages = Math.ceil(totalLinks / validLimit);

    return Response.json({
      success: true,
      data: links,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalLinks,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch links:", error);
    return Response.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
