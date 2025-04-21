import React from "react";
import { UserHeader } from "@/components/user-header";
import { AuthProvider } from "@/components/auth-provider";

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <UserHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} MusicMatch. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
