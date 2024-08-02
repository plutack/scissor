import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { shortenLinkSchema } from "@/schemas";
import { generateUniqueLink } from "@/utils/create";
import { decode } from "next-auth/jwt";

export async function GET(request: Request) {
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
    console.log("session", session);
    userId = session?.user?.id;
  }

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);

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

    return Response.json({
      success: true,
      data: links,
      pagination: {
        page,
        limit,
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

    const data = await db.link.create({
      data: {
        name: validatedFields.data.name,
        link,
        customSuffix,
        userId,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
