import { NextResponse } from "next/server";
import { shortenLinkSchema } from "@/schemas";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateUniqueLink } from "@/utils/create";
import { decode } from "next-auth/jwt";

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
        link,
        customSuffix,
        userId,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
