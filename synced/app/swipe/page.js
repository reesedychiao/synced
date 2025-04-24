"use client";

import { SwipeInterface } from "../../components/swipe-interface";
import useRouter from "next/navigation";
import useSession from "next-auth/react";

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
    <div className="container mx-auto max-w-md py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Discover New Music
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        Swipe right on songs you like, left on songs you don't.
      </p>
      <SwipeInterface />
    </div>
  );
}
