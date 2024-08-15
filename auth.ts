import NextAuth from "next-auth";
import "next-auth/jwt";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import "next-auth";
import { userRole } from "@prisma/client";
import { encode } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: userRole;
    accessToken?: string;
    totalClicks?: number;
    uniqueCountryCount?: number;
    totalLinksCount?: number;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: userRole;
    totalClicks?: number;
    uniqueCountryCount?: number;
    totalLinksCount?: number;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userWithLinks = await db.user.findUnique({
          where: { id: user.id },
          include: { links: true },
        });
        token.role = user.role;
        token.totalClicks = user.totalClicks;
        token.uniqueCountryCount = user.uniqueCountryCount;
        token.totalLinksCount = userWithLinks?.links.length || 0;
      }
      return token;
    },

    async session({ session, token, user }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.totalClicks = token.totalClicks;
        session.user.uniqueCountryCount = token.uniqueCountryCount; 
        session.user.totalLinksCount = token.totalLinksCount;
      }
      
      const { id, ...restOfUser } = session.user;
      session.user = { id, ...restOfUser };
      return session;
    },
  },
});
