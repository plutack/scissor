import ErrorWithStatus from "@/exception/custom-error";
import * as linkService from "@/services/link-service";
import rateLimitIP from "@/utils/rate-limit";
import logger from "@/lib/logger";

const log = logger.child({ route: "/api/link/click" });

export async function PATCH(request: Request) {
  try {
    log.info("PATCH request called");
    await rateLimitIP(request);
    const body = await request.json();
    const { customSuffix, country }: { customSuffix: string; country: string } =
      body;

    if (!customSuffix || !country) {
      throw new ErrorWithStatus("Invalid fields", 400);
    }

    await linkService.updateDbOnLinkClick(customSuffix, country);

    return Response.json({ status: 204 });
  } catch (error) {
    log.error("Error updating link click", error);
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    return Response.json(
      { message: "Error updating link click" },
      { status: 500 },
    );
  }
}
