import { db } from "@/lib/db";
import { Link } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { customSuffix: string } },
) {
  const { customSuffix } = params;

  const existinglink = await db.link.findUnique({
    where: {
      customSuffix,
    },
  });

  if (!existinglink) {
    return Response.json(
      { success: false, message: "Link not found" },
      { status: 404 },
    );
  }

  return Response.json(
    { success: true, data: existinglink.link },
    { status: 200 },
  );
}
