import { changeCustomSuffixSchema } from "@/schemas";
import { getUserIdFromRequest } from "@/utils/auth";
import * as linkService from "@/services/link-service";
import ErrorWithStatus from "@/exception/custom-error";
import { validateWithSchema } from "@/utils/validate-request";
import rateLimitIP from "@/utils/rate-limit";
import logger from "@/lib/logger";

const log = logger.child({ route: "/api/link/[linkId]" });

export async function GET(
  request: Request,
  { params }: { params: { linkId: string } },
) {
  try {
    log.info("GET request called");
    await rateLimitIP(request);
    const userId = await getUserIdFromRequest(request);
    const { linkId } = params;
    if (!userId) {
      throw new ErrorWithStatus("Unauthorized", 401);
    }

    const data = await linkService.getLinkStats(linkId, userId);

    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    log.error("Error in GET request", error);
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, message: error.message },
        {
          status: error.status,
        },
      );
    }
    return Response.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { linkId: string } },
) {
  try {
    const { linkId } = params;
    log.info("PATCH request called");
    const [userId, validatedObject] = await Promise.all([
      getUserIdFromRequest(request),
      validateWithSchema(request, changeCustomSuffixSchema),
    ]);

    // If still no userId, return unauthorized
    if (!userId) {
      throw new ErrorWithStatus("Unauthorized", 401);
    }

    await linkService.updateLink(linkId, userId, validatedObject);
    return Response.json(
      { success: true, message: "Custom suffix changed succesfully" },
      { status: 200 },
    );
  } catch (error) {
    log.error("Error in PATCH request", error);
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, message: error.message },
        {
          status: error.status,
        },
      );
    }
    return Response.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
