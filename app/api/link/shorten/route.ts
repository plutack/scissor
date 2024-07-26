import { shortenLinkSchema } from "@/schemas";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateUniqueLink } from "@/utils/create";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    console
    const validatedFields = shortenLinkSchema.safeParse(body);
    console.log(validatedFields);
    if (!validatedFields.success) {
      return Response.json({ error: "Invalid fields" }, { status: 400 });
    }
    const { link } = validatedFields.data;
    const customSuffix = await generateUniqueLink(validatedFields.data);
    const session = await auth();
    const data = await db.link.create({
      data: {
        link,
        customSuffix,
        userId: session?.user.id,
      },
    });
    return Response.json({ success: true, data });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
