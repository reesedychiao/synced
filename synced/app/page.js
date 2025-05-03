"use client";

import { Button } from "../components/ui/button";
import { Headphones, Music, Heart } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const syncUser = async () => {
      try {
        const res = await fetch("http://localhost:5050/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: session.user.email,
            name: session.user.name,
            email: session.user.email,
          }),
        });

        if (res.ok) {
          console.log("User synced with backend");
        } else {
          console.error("Failed to sync user:", await res.text());
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    syncUser();
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-6 w-6 ml-16" />
            <span className="text-xl font-bold">Synced</span>
          </div>
          <div className="flex items-senter gap-2">
            {session ? (
              <>
                <span className="text-lg font-light mt-1 mr-4 align-middle">
                  Welcome, {session.user?.name}
                </span>
                <Button onClick={() => signOut({ callbackUrl: "/" })}>
                  Log Out
                </Button>
              </>
            ) : (
              <Button onClick={() => signIn("github")}>Sign In</Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 mt-16">
        <section className="container py-6 md:py-12 lg:py-16">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Find Your Sound, Find Your Match
            </h1>
            {session ? (
              <Link href="/swipe">
                <Button>Start</Button>
              </Link>
            ) : (
              <></>
            )}
          </div>
        </section>
        <section className="container py-6 md:py-12 lg:py-16">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Discover Music</h3>
              <p className="text-muted-foreground">
                Find new songs and artists based on your preferences.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Match Your Taste</h3>
              <p className="text-muted-foreground">
                Our algorithm learns what you love and recommends similar
                tracks.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Simple Interface</h3>
              <p className="text-muted-foreground">
                Swipe left or right on songs to refine your musical profile.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
