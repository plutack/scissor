import { signOut } from "next-auth/react";
import { loginRoute } from "@/routes";

export const logout = async () => {
  await signOut({
    callbackUrl: loginRoute,
  });
};
