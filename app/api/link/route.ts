import { validateWithSchema } from "@/utils/validate-request";
import { getUserIdFromRequest } from "@/utils/auth";
import { shortenLinkSchema } from "@/schemas";
import generateUniqueLink from "@/utils/generate-suffix";
import * as linkService from "@/services/link-service";
import ErrorWithStatus from "@/exception/custom-error";
import rateLimitIP from "@/utils/rate-limit";
import logger from "@/lib/logger";

const log = logger.child({ route: "/api/link" });

export async function GET(request: Request) {
  try {
    log.info("GET request called");
    await rateLimitIP(request);
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      throw new ErrorWithStatus("Unauthorized", 401);
    }

    const url = new URL(request.url);
    const { data, pagination } = await linkService.getAllLinks(url, userId);
    return Response.json({ success: true, data, pagination });
  } catch (error) {
    log.error("Error in GET request", error);
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    return Response.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    log.info("POST request called");
    await rateLimitIP(request);
    const [userId, validatedObject] = await Promise.all([
      getUserIdFromRequest(request),
      validateWithSchema(request, shortenLinkSchema),
    ]);
    const customSuffix = await generateUniqueLink(validatedObject);
    const data = await linkService.createLink(
      validatedObject,
      userId,
      customSuffix,
    );
    return Response.json({ success: true, data });
  } catch (error) {
    log.error("Error in POST request", error);
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    return Response.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
