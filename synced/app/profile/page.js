"use client";

import { Button } from "../../components/ui/button";
import { Headphones, Heart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function LikedSongsPage() {
  const { data: session, status } = useSession();

  const likedSongs = [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      link: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
    },
    {
      id: 2,
      title: "Levitating",
      artist: "Dua Lipa",
      link: "https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9",
    },
    {
      id: 3,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      link: "https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY",
    },
  ];

  if (status === "loading") {
    return <div>Loading...</div>;
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
      <main>
        <section className="container py-6 md:py-12 lg:py-16">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Your Liked Songs
            </h1>
            {session ? (
              <Link href="/swipe">
                <Button>Discover More</Button>
              </Link>
            ) : (
              <></>
            )}
          </div>
        </section>
        <section className="container py-6 md:py-12 lg:py-16">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {likedSongs.length > 0 ? (
              likedSongs.map((song) => (
                <Link
                  href={song.link}
                  target="_blank"
                  key={song.id}
                  className="flex items-center gap-4 rounded-lg border p-4 transition hover:bg-gray-100"
                >
                  <Image
                    src="/"
                    alt="Album cover"
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold">{song.title}</h3>
                    <p className="text-muted-foreground">{song.artist}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                You haven't liked any songs yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
