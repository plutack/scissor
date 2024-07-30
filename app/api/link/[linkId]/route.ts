import { auth } from "@/auth";
import { db } from "@/lib/db";
import { decode } from "next-auth/jwt";
import { changeCustomSuffixSchema } from "@/schemas";

export async function GET(
  req: Request,
  { params }: { params: { linkId: string } },
) {
  const session = await auth();
  const { linkId } = params;

  const existingLink = await db.link.findUnique({
    where: {
      id: linkId,
      OR: [{ userId: session?.user?.id }, { userId: null }],
    },
  });

  if (!existingLink) {
    return Response.json(
      { success: false, message: "Link not found" },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: existingLink }, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { linkId: string } },
) {
  try {
    let userId;
    const { linkId } = params;

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
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = changeCustomSuffixSchema.safeParse(body);
    console.log(validatedFields);
    if (!validatedFields.success) {
      return Response.json(
        { success: false, message: "Invalid fields" },
        { status: 400 },
      );
    }

    const { customSuffix } = validatedFields.data;

    const isExisting = !!(await db.link.findUnique({
      where: {
        customSuffix,
      },
    }));

    if (isExisting) {
      return Response.json(
        { success: false, message: "custom suffix in use" },
        { status: 409 },
      );
    }
    const data = await db.link.update({
      where: {
        id: linkId,
        userId,
      },
      data: {
        customSuffix,
      },
    });
    return Response.json(
      { success: true, message: "Custom suffix changed succesfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
