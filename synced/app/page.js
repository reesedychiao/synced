"use client";

import { Button } from "../components/ui/button";
import { Headphones, Music, Heart } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";

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

        if (!res.ok) {
          console.error("Failed to sync user:", await res.text());
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    syncUser();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Headphones className="h-7 w-7 text-primary" />
            <span className="text-2xl font-semibold tracking-tight">
              Synced
            </span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Welcome,{" "}
                  <span className="font-medium">{session.user?.name}</span>
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

      <main className="flex-1">
        <motion.section
          className="container mx-auto px-6 py-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl font-extrabold tracking-tight md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Find Your Sound, Find Your Match
          </motion.h1>
          {session && (
            <motion.div
              className="mt-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/swipe">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Start Swiping
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.section>
        <motion.section
          className="container mx-auto px-6 py-16"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Music className="h-6 w-6 text-primary" />,
                title: "Discover Music",
                desc: "Find new songs and artists based on your preferences.",
              },
              {
                icon: <Heart className="h-6 w-6 text-primary" />,
                title: "Match Your Taste",
                desc: "Our algorithm learns what you love and recommends similar tracks.",
              },
              {
                icon: <Headphones className="h-6 w-6 text-primary" />,
                title: "Simple Interface",
                desc: "Swipe left or right on songs to refine your musical profile.",
              },
            ].map(({ icon, title, desc }, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-4 rounded-xl border p-6 text-center shadow-sm transition hover:shadow-md"
                whileHover={{ y: -4 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="rounded-full bg-primary/10 p-3">{icon}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
