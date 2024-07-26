import { auth } from "@/auth";
import { db } from "@/lib/db";

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
    return Response.json({ error: "Link not found" }, { status: 404 });
  }

  return Response.json({ success: true, data: existingLink });
}
