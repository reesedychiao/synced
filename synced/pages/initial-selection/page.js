import { InitialSongSelection } from "@/components/initial-song-selection";

export default function InitialSelectionPage() {
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Let's Get to Know Your Taste
      </h1>
      <p className="mb-8 text-center text-lg text-muted-foreground">
        Select at least 5 songs you like to help us recommend music you'll love.
      </p>
      <InitialSongSelection />
    </div>
  );
}
