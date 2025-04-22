"use client";

import { signIn, signOut } from "next-auth/react";

export const login = async () => {
  await signIn("github", { redirectTo: "/" });
};

export const logout = async () => {
  await signOut({ callbackUrl: "/" });
};
