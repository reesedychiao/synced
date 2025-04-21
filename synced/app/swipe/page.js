import { SwipeInterface } from "@/components/swipe-interface";

export default function SwipePage() {
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
