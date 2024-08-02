// FIXME ensure /* is skipped

import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  ProtectedRoutes,
  loginRoute,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!request.auth;
  const isAuthRoute = authRoutes.includes(pathname);
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isLoginRoute = pathname === loginRoute;
  const isProtectedRoute = pathname.startsWith(ProtectedRoutes);

  if (isApiAuthRoute) {
    return;
  }
  if (isLoginRoute && !isLoggedIn) {
    return;
  }

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL(loginRoute, request.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }
  return;
});
