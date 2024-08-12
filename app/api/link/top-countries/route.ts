import { getUserIdFromRequest } from "@/utils/auth";
import ErrorWithStatus from "@/Exception/custom-error";
import * as linkService from "@/services/link-service";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      throw new ErrorWithStatus("Unauthorized", 401);
    }
    const topCountries = await linkService.getUserTopCountries(userId);
    return Response.json(
      { success: true, data: topCountries },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
      return Response.json({ success: false, error: error.message }, { status: error.status });
    }
    return Response.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
