import * as linkService from "@/services/link-service";
import ErrorWithStatus from "@/Exception/custom-error";

export async function GET(
  req: Request,
  { params }: { params: { customSuffix: string } },
) {
  try {
    const { customSuffix } = params;
    const existinglink = await linkService.getLinkByCustomSuffix(customSuffix);

    if (!existinglink) {
      throw new ErrorWithStatus("Link not found", 404);
    }

    return Response.json(
      { success: true, data: existinglink.link },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    return Response.json({ success: false, message: "Error fetching link" }, { status: 500 });
  }
}
