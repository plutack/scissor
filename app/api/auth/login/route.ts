import { loginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { ZodError } from "zod";
import sanitizeUser from "@/utils/sanitize-user";

export async function POST(request: Request, response: Response) {
  try {
    const body = await request.json();
    const validatedFields = loginSchema.safeParse(body);
    console.log(validatedFields);
    if (!validatedFields.success) {
      return Response.json(
        { sucess: false, error: "Invalid fields" },
        { status: 400 },
      );
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
    return Response.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return Response.json(
            { success: false, error: "Invalid credentials" },
            { status: 401 },
          );
        default:
          return Response.json(
            { success:false, error: "Something went wrong" },
            { status: 500 },
          );
      }
    }
    return Response.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
