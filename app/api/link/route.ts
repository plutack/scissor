import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { shortenLinkSchema } from "@/schemas";
import { generateUniqueLink } from "@/utils/create";
import { decode } from "next-auth/jwt";

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

export async function POST(request: Request) {
  try {
    let userId;

    // Check for Bearer token
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decodedToken = await decode({
          token,
          secret: process.env.AUTH_SECRET!,
          salt: "authjs.session-token",
        });
        if (decodedToken) {
          userId = decodedToken.sub;
        }
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    // If no valid Bearer token, fall back to session
    if (!userId) {
      const session = await auth();
      userId = session?.user?.id;
    }

    // If still no userId, return unauthorized

    const body = await request.json();
    const validatedFields = shortenLinkSchema.safeParse(body);
    console.log(validatedFields);
    if (!validatedFields.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    const { link } = validatedFields.data;
    const customSuffix = await generateUniqueLink(validatedFields.data);

    const isExisting = !!(await db.link.findUnique({
      where: {
        customSuffix,
      },
    }));

    if (isExisting) {
      return Response.json(
        { success: false, error: "custom suffix in use" },
        { status: 409 },
      );
    }

    const data = await db.link.create({
      data: {
        link,
        customSuffix,
        userId,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) console.log("error", error.message);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
