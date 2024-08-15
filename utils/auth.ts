import { decode } from "next-auth/jwt";
import { auth } from "@/auth";
import logger from "@/lib/logger";

const log = logger.child({ util: "Auth" });

export const getUserIdFromRequest = async (request: Request) => {
  log.info("Function called");
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await decode({
        token,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token",
      });
      if (decodedToken) {
        return decodedToken.sub;
      }
    } catch (error) {
      log.error("Token verification failed:", error);
    }
  }
  // If no valid Bearer token, fall back to session
  const session = await auth();
  return session?.user?.id;
};
