"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { mockSongs } from "@/lib/mock-data";

export function InitialSongSelection() {
  const router = useRouter();
  const [selectedSongs, setSelectedSongs] = useState([]);

  const toggleSongSelection = (songId) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSubmit = async () => {
    try {
      // This would be replaced with your actual API call
      await fetch("/api/user/initial-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songIds: selectedSongs }),
      });

      router.push("/swipe");
    } catch (error) {
      console.error("Failed to save initial preferences:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mockSongs.map((song) => (
          <Card
            key={song.id}
            className={`overflow-hidden transition-all ${
              selectedSongs.includes(song.id)
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            }`}
          >
            <div className="relative">
              <Image
                src={song.albumCover || "/placeholder.svg"}
                alt={`${song.title} album cover`}
                width={300}
                height={300}
                className="aspect-square object-cover"
              />
              <button
                onClick={() => toggleSongSelection(song.id)}
                className="absolute right-2 top-2 rounded-full bg-background p-1 shadow-md"
              >
                {selectedSongs.includes(song.id) ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{song.title}</h3>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={selectedSongs.length < 5}
        >
          {selectedSongs.length < 5
            ? `Select ${5 - selectedSongs.length} more song${
                selectedSongs.length === 4 ? "" : "s"
              }`
            : "Continue to Recommendations"}
        </Button>
      </div>
    </div>
  );
}
