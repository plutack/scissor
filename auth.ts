import NextAuth from "next-auth";
import "next-auth/jwt";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import "next-auth";
import { userRole } from "@prisma/client";
import { encode } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id?: string;
    role?: userRole;
    accessToken?: string;
  }
  /**
   * The shape of the account object returned in the OAuth providers' `account` callback,
   * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
   */
  interface Account {}

  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    // idToken?: string;
    /** User role */
    id: string;
    role?: userRole;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        console.log(user);
        token.userToken = user.accessToken;

        console.log("token1", token);
      }
      return token;
    },

    session({ session, token }) {
      console.log("token2", token);
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      const { id, ...restOfUser } = session.user;
      session.user = { id, ...restOfUser };
      console.log("session", session);
      return session;
    },
  },
});
