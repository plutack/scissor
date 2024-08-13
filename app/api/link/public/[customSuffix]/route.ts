import * as linkService from "@/services/link-service";
import ErrorWithStatus from "@/exception/custom-error";
import rateLimitIP from "@/utils/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: { customSuffix: string } },
) {
  try {
    await rateLimitIP(request);
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
    return Response.json(
      { success: false, message: "Error fetching link" },
      { status: 500 },
    );
  }
}
