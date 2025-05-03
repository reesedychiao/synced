"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactPlayer from "react-player/youtube";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  ThumbsUp,
  ThumbsDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSongRecommendations } from "../hooks/use-song-recommendations";

export function SwipeInterface() {
  const { currentSong, isLoading, swipeLeft, swipeRight } =
    useSongRecommendations();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchYouTubeUrl = async () => {
      if (!currentSong?.name || !currentSong?.artists) return;

      try {
        const query = `${currentSong.name} ${currentSong.artists}`;
        const res = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data.videoId) {
          setVideoUrl(`https://www.youtube.com/watch?v=${data.videoId}`);
        } else {
          setVideoUrl(null);
        }
      } catch (err) {
        console.error("Error fetching YouTube video:", err);
        setVideoUrl(null);
      }
    };

    fetchYouTubeUrl();
  }, [currentSong]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragMove);
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!isDragging || !cardRef.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const offset = clientX - centerX;

    setDragOffset(offset);

    const rotation = offset * 0.1;
    cardRef.current.style.transform = `translateX(${offset}px) rotate(${rotation}deg)`;
  };

  const handleDragEnd = () => {
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("touchend", handleDragEnd);

    if (cardRef.current) {
      if (dragOffset > 100) {
        handleSwipeRight();
      } else if (dragOffset < -100) {
        handleSwipeLeft();
      } else {
        cardRef.current.style.transform = "";
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const handleSwipeLeft = () => {
    swipeLeft();
    setIsPlaying(true);
  };

  const handleSwipeRight = () => {
    swipeRight();
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (isLoading || !currentSong) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={cardRef}
        className="w-full touch-none select-none"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <Card className="overflow-hidden shadow-lg">
          <div className="relative">
            <Image
              src={currentSong.albumCover || "/placeholder.svg"}
              alt={`${currentSong.name} album cover`}
              width={500}
              height={500}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{currentSong.name}</h2>
              <p className="text-lg">{currentSong.artists}</p>
            </div>
          </div>
          <CardContent className="p-4">
            {videoUrl ? (
              <ReactPlayer
                url={videoUrl}
                playing={isPlaying}
                volume={isMuted ? 0 : 0.5}
                controls
                width="0%"
                height="0px"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No sound available
              </p>
            )}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlayback}
                  className="h-8 w-8"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="h-8 w-8"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex w-full justify-center gap-8">
        <Button
          size="icon"
          variant="outline"
          className="h-16 w-16 rounded-full"
          onClick={handleSwipeLeft}
        >
          <ThumbsDown className="h-8 w-8" />
        </Button>
        <Button
          size="icon"
          className="h-16 w-16 rounded-full"
          onClick={handleSwipeRight}
        >
          <ThumbsUp className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
