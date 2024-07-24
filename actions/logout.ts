"use server";
import { signOut } from "@/auth";
import { loginRoute } from "@/routes";

export const logout = async () => {
  await signOut({
    redirectTo: loginRoute,
  });
};
