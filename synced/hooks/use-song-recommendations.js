"use client";

import { useState, useEffect, useCallback } from "react";
import { mockSongs } from "@/lib/mock-data";
import { Song } from "@/types/song";

export function useSongRecommendations() {
  const [currentSong, setCurrentSong] = (useState < Song) | (null > null);
  const [isLoading, setIsLoading] = useState(true);
  const [seenSongs, setSeenSongs] = useState < Set < string >> new Set();

  const fetchNextRecommendation = useCallback(async () => {
    setIsLoading(true);

    try {
      // This would be replaced with your actual API call to the Flask backend
      // const response = await fetch('/api/recommendations/next');
      // const data = await response.json();

      // For now, we'll use mock data
      const unseenSongs = mockSongs.filter((song) => !seenSongs.has(song.id));

      if (unseenSongs.length === 0) {
        // If we've seen all songs, reset
        setSeenSongs(new Set());
        setCurrentSong(mockSongs[0]);
      } else {
        const randomIndex = Math.floor(Math.random() * unseenSongs.length);
        setCurrentSong(unseenSongs[randomIndex]);
      }
    } catch (error) {
      console.error("Failed to fetch recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [seenSongs]);

  useEffect(() => {
    fetchNextRecommendation();
  }, [fetchNextRecommendation]);

  const swipeLeft = useCallback(async () => {
    if (!currentSong) return;

    try {
      // This would be replaced with your actual API call
      await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: currentSong.id,
          liked: false,
        }),
      });

      setSeenSongs((prev) => new Set([...prev, currentSong.id]));
      fetchNextRecommendation();
    } catch (error) {
      console.error("Failed to send feedback:", error);
    }
  }, [currentSong, fetchNextRecommendation]);

  const swipeRight = useCallback(async () => {
    if (!currentSong) return;

    try {
      // This would be replaced with your actual API call
      await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: currentSong.id,
          liked: true,
        }),
      });

      setSeenSongs((prev) => new Set([...prev, currentSong.id]));
      fetchNextRecommendation();
    } catch (error) {
      console.error("Failed to send feedback:", error);
    }
  }, [currentSong, fetchNextRecommendation]);

  return {
    currentSong,
    isLoading,
    swipeLeft,
    swipeRight,
  };
}
