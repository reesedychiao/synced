"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

async function fetchSpotifyData(title, artist) {
  try {
    const response = await fetch(
      `/api/spotify/search?title=${encodeURIComponent(
        title
      )}&artist=${encodeURIComponent(artist)}`
    );
    if (!response.ok) throw new Error("Spotify search failed");
    const data = await response.json();
    return {
      albumCover: data.albumCover,
      previewUrl: data.previewUrl,
    };
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return { albumCover: null, previewUrl: null };
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
    const { albumCover, previewUrl } = await fetchSpotifyData(
      song.title,
      song.artist
    );
    return {
      ...song,
      albumCover,
      previewUrl,
    };
  };

  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/users/${userId}/recommendations`
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
        ? `http://localhost:5000/users/${userId}/songs`
        : `http://localhost:5000/users/${userId}/songs/${song.id}/dislike`;

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: liked
          ? JSON.stringify({
              name: song.title,
              artist: song.artist,
              album_cover: song.albumCover,
              spotify_id: song.spotify_id,
              genre: song.genre,
            })
          : null,
      });
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const swipeLeft = async () => {
    await handleFeedback(false);
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
