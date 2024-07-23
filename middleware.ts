import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  PublicRoutes,
  loginRoute,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoutes = PublicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }
  if (!isLoggedIn && !isPublicRoutes) {
    return Response.redirect(new URL(loginRoute, nextUrl));
  }
  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  // switch to clerk version
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
