"use client";

import { SwipeInterface } from "../../components/swipe-interface";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Headphones } from "lucide-react";
import { Button } from "../../components/ui/button";
import Link from "next/link";

export default function SwipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <div className="container mx-auto">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-6 w-6" />
            <span className="text-xl font-bold">Synced</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-light mt-1">
              Welcome, {session.user?.name}
            </span>
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            <Button onClick={() => signOut({ callbackUrl: "/" })}>
              Log Out
            </Button>
          </div>
        </div>
      </header>
      <div className="max-w-md mx-auto">
        <h1 className="my-8 text-center text-3xl font-bold">
          Discover New Music
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          Swipe right on songs you like, left on songs you don't.
        </p>
        <SwipeInterface />
      </div>
    </div>
  );
}
