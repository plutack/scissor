import Twitter from "next-auth/providers/twitter";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export default { providers: [Twitter, Google] } satisfies NextAuthConfig;
