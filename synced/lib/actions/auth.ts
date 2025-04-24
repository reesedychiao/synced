"use client";

import { signIn, signOut } from "next-auth/react";

export const login = async () => {
  await signIn("github", { redirectTo: "/swipe" });
};

export const logout = async () => {
  await signOut({ callbackUrl: "/" });
};
