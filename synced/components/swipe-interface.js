"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ThumbsUp,
  ThumbsDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSongRecommendations } from "@/hooks/use-song-recommendations";

export function SwipeInterface() {
  const { currentSong, isLoading, swipeLeft, swipeRight } =
    useSongRecommendations();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const cardRef = useRef < HTMLDivElement > null;
  const audioRef = (useRef < HTMLAudioElement) | (null > null);

  useEffect(() => {
    if (currentSong?.previewUrl) {
      audioRef.current = new Audio(currentSong.previewUrl);
      audioRef.current.volume = isMuted ? 0 : 0.5;
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [currentSong, isMuted]);

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

    // Rotate slightly based on drag
    const rotation = offset * 0.1;
    cardRef.current.style.transform = `translateX(${offset}px) rotate(${rotation}deg)`;
  };

  const handleDragEnd = () => {
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("touchend", handleDragEnd);

    if (cardRef.current) {
      // If dragged far enough, trigger swipe
      if (dragOffset > 100) {
        handleSwipeRight();
      } else if (dragOffset < -100) {
        handleSwipeLeft();
      } else {
        // Reset position if not swiped far enough
        cardRef.current.style.transform = "";
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const handleSwipeLeft = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "translateX(-1000px) rotate(-30deg)";
      cardRef.current.style.transition = "transform 0.5s ease";

      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = "";
          cardRef.current.style.transform = "";
        }
        swipeLeft();
        stopAudio();
      }, 500);
    }
  };

  const handleSwipeRight = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "translateX(1000px) rotate(30deg)";
      cardRef.current.style.transition = "transform 0.5s ease";

      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = "";
          cardRef.current.style.transform = "";
        }
        swipeRight();
        stopAudio();
      }, 500);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.volume = isMuted ? 0.5 : 0;
    setIsMuted(!isMuted);
  };

  const stopAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
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
              alt={`${currentSong.title} album cover`}
              width={500}
              height={500}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{currentSong.title}</h2>
              <p className="text-lg">{currentSong.artist}</p>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Album: {currentSong.album}
                </p>
                <p className="text-sm text-muted-foreground">
                  Genre: {currentSong.genre}
                </p>
              </div>
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
