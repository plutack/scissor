import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas";
import type { NextAuthConfig } from "next-auth";
import { findUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await findUserByEmail(email);
          if (!user || !user.password) return null;
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            return user;
          }
        }
        return null
      },
    }),
  ],
} satisfies NextAuthConfig;
