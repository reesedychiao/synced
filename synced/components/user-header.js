"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Headphones, User, LogOut, Settings } from "lucide-react";

export function UserHeader() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href={user ? "/swipe" : "/"} className="flex items-center gap-2">
          <Headphones className="h-6 w-6" />
          <span className="text-xl font-bold">MusicMatch</span>
        </Link>

        <nav className="hidden md:flex md:gap-6">
          {user && (
            <>
              <Link
                href="/swipe"
                className={`text-sm font-medium ${
                  pathname === "/swipe"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Discover
              </Link>
              <Link
                href="/liked"
                className={`text-sm font-medium ${
                  pathname === "/liked"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Liked Songs
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium ${
                  pathname === "/profile"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Profile
              </Link>
            </>
          )}
        </nav>

        {isLoading ? (
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                {user.picture ? (
                  <img
                    src={user.picture || "/placeholder.svg"}
                    alt={user.name || "User avatar"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex w-full cursor-pointer items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="flex w-full cursor-pointer items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/api/auth/logout"
                  className="flex w-full cursor-pointer items-center text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/api/auth/login">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
