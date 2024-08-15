import ErrorWithStatus from "@/exception/custom-error";
import * as linkService from "@/services/link-service";
import rateLimitIP from "@/utils/rate-limit";

export async function PATCH(request: Request) {
  try {
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
    if (error instanceof ErrorWithStatus) {
      console.log("Error updating link click:", error);
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
