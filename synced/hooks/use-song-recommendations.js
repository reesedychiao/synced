"use client";

import { useState, useEffect, useCallback } from "react";

async function fetchSpotifyData(title, artist) {
  try {
    const response = await fetch(
      `/api/spotify/search?title=${encodeURIComponent(
        title
      )}&artist=${encodeURIComponent(artist)}`
    );
    if (!response.ok) {
      throw new Error("Spotify search failed");
    }
    const data = await response.json();
    return {
      albumCover: data.albumCover,
      previewUrl: data.previewUrl,
    };
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return {
      albumCover: null,
      previewUrl: null,
    };
  }
}

export function useSongRecommendations() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seenSongs, setSeenSongs] = useState(new Set());

  const fetchNextRecommendation = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/recommendation/next");
      if (!response.ok) {
        throw new Error("Failed to fetch next recommendation");
      }
      const data = await response.json();
      if (!data) {
        console.error("No song data received");
        return;
      }
      const { albumCover, previewUrl } = await fetchSpotifyData(
        data.title,
        data.artist
      );
      const enhancedSong = {
        ...data,
        albumCover,
        previewUrl,
      };
      setCurrentSong(enhancedSong);
    } catch (error) {
      console.error("Failed to fetch recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextRecommendation();
  }, [fetchNextRecommendation]);

  const swipeLeft = useCallback(async () => {
    if (!currentSong) return;

    try {
      await fetch("http://localhost:5000/recommendation/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song_id: currentSong.id,
          title: currentSong.title,
          artist: currentSong.artist,
          liked: false,
        }),
      });

      fetchNextRecommendation();
    } catch (error) {
      console.error("Failed to send feedback:", error);
    }
  }, [currentSong, fetchNextRecommendation]);

  const swipeRight = useCallback(async () => {
    if (!currentSong) return;

    try {
      await fetch("http://localhost:5000/recommendation/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song_id: currentSong.id,
          title: currentSong.title,
          artist: currentSong.artist,
          liked: true,
        }),
      });

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
