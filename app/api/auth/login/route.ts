import { loginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { cookies } from "next/headers";
import { sanitizeUser } from "@/services/user-service";
import rateLimitIP from "@/utils/rate-limit";
import ErrorWithStatus from "@/exception/custom-error";
import { AuthError } from "next-auth";
import logger from "@/lib/logger";

const log = logger.child({
  route: "/api/auth/login",
});

export async function POST(request: Request, response: Response) {
  try {
    log.info("Login request received");
    await rateLimitIP(request);
    const body = await request.json();
    const validatedFields = loginSchema.safeParse(body);
    if (!validatedFields.success) {
      throw new ErrorWithStatus("Invalid fields", 400);
    }

    const { email, password } = validatedFields.data;

    await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });

    const user = await sanitizeUser(email);

    const accessToken = cookies().get("authjs.session-token")?.value;
    log.debug("accessToken", accessToken);
    return Response.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    log.error("Error during login", error);
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    // Handle AuthError
    if (error instanceof AuthError) {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }
    return Response.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
