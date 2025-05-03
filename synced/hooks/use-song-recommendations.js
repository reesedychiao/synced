"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

async function fetchSpotifyData(title, year) {
  try {
    const response = await fetch(
      `/api/spotify/search?title=${encodeURIComponent(
        title
      )}&year=${encodeURIComponent(year)}`
    );

    const data = await response.json();

    return {
      albumCover: data.albumCover,
      externalUrl: data.externalUrl,
      artists: data.artists,
    };
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return {
      albumCover: null,
      externalUrl: null,
      artists: null,
    };
  }
}

export function useSongRecommendations() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [recommendations, setRecommendations] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const enhanceSong = async (song) => {
    const { albumCover, externalUrl, artists } = await fetchSpotifyData(
      song.name,
      song.year
    );
    return {
      ...song,
      albumCover,
      externalUrl,
      artists,
    };
  };

  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5050/users/${userId}/recommendations`
      );
      const songs = await res.json();
      const enhanced = await Promise.all(
        songs.map((song) => enhanceSong(song))
      );
      setRecommendations(enhanced);
      setCurrentSongIndex(0);
      setCurrentSong(enhanced[0] || null);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchRecommendations();
  }, [fetchRecommendations, userId]);

  const handleFeedback = async (liked) => {
    const song = recommendations[currentSongIndex];
    if (!song) return;

    try {
      const endpoint = liked
        ? `http://localhost:5050/users/${userId}/songs`
        : `http://localhost:5050/users/${userId}/songs/${song.id}/dislike`;

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: liked
          ? JSON.stringify({
              name: song.name,
              artists: song.artists,
              albumCover: song.albumCover,
              externalUrl: song.externalUrl,
              year: song.year,
              liked: true,
            })
          : null,
      });
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const swipeLeft = async () => {
    // await handleFeedback(false);
    showNextSong();
  };

  const swipeRight = async () => {
    await handleFeedback(true);
    showNextSong();
  };

  const showNextSong = () => {
    const nextIndex = currentSongIndex + 1;
    if (nextIndex < recommendations.length) {
      setCurrentSongIndex(nextIndex);
      setCurrentSong(recommendations[nextIndex]);
    } else {
      fetchRecommendations(); // Fetch new batch
    }
  };

  return {
    currentSong,
    isLoading,
    swipeLeft,
    swipeRight,
  };
}
