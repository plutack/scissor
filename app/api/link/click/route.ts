import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { customSuffix, country } = body;

    if (!customSuffix || !country) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await db.$transaction(async (tx) => {
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

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating link click:", error);
    return NextResponse.json(
      { message: "Error updating link click" },
      { status: 500 },
    );
  }
}
