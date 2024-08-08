import { db } from "@/lib/db";
import { NextResponse } from "next/server";
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
    take: 5,
  });

  const formattedData = topCountries.map((country) => ({
    country: country.country,
    clicks: country._sum.count || 0,
  }));

  return NextResponse.json(formattedData);
}
