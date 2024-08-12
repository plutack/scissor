import ErrorWithStatus from "@/Exception/custom-error";
import * as userService from "@/services/user-service";
import { getUserIdFromRequest } from "@/utils/auth";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      throw new ErrorWithStatus("Unauthorized", 401);
    }

    const data = await userService.getUserStats(userId);
    return Response.json({ success: true, data });
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
     return Response.json({ success: false, error: error.message }, { status: error.status });
    }
    return Response.json(
      { 
        success: false,
        error: "internal server error",
      },
      { status: 500 },
    );
  }
}
