// app/api/links/[id]/top-countries/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      linkId: string;
    };
  },
) {
  const { linkId } = params;
  const { searchParams } = new URL(req.url);
  console.log("searchParams", searchParams);
  const userId = searchParams.get("userId");
  console.log("userId", userId);

  if (!linkId) {
    return NextResponse.json({ error: "Link ID is required" }, { status: 400 });
  }

  const topCountries = await db.visit.findMany({
    where: {
      linkId: linkId,
    },
    orderBy: {
      count: "desc",
    },
    take: 5,
  });

  return NextResponse.json(topCountries);
}
