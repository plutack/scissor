import { NextResponse } from "next/server";
import { LoginSchema } from "@/schemas";
import { auth, signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import {} from "next-auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = LoginSchema.safeParse(body);
    console.log(validatedFields);
    if (!validatedFields.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    const { email, password } = validatedFields.data;

    await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
    const session = await auth();

    return NextResponse.json({
      success: true,
      redirectUrl: DEFAULT_LOGIN_REDIRECT,
      user: session,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 },
          );
        default:
          return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
          );
      }
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
