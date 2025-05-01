import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

type PlayButtonProps = {
  song: Song;
  songs: Song[];
  className?: string;
};

const PlayButton = ({ song, songs, className }: PlayButtonProps) => {
  const { currentSong, isPlaying, setCurrentSong, togglePlay, initializeQueue } =
    usePlayerStore();
  const isCurrentSong = currentSong?._id === song._id;

  const [isLoading, setIsLoading] = useState(false);

  const {userId} = useAuth();
  const handlePlay = async () => {
    setIsLoading(true);
    if (isCurrentSong) {
      togglePlay(userId || "");
    } else {
      await setCurrentSong(song, userId || "");
      initializeQueue(songs, userId || "", true);
    }
    setIsLoading(false);
  };
  // console.log("userId", userId)

  return (
    <Button
      size="icon"
      onClick={handlePlay}
      className={`absolute inset-0 m-auto flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all duration-300 ease-in-out
    bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500
    border border-sky-700/30 hover:border-sky-600/50 ${
      isLoading ? "animate-pulse" : ""
    }
    ${
      isCurrentSong && isPlaying
        ? "opacity-100 scale-100 ring-2 ring-sky-400/50"
        : "opacity-0 scale-95"
    }
    group-hover:opacity-100 group-hover:scale-105
    active:scale-90 ${className}`}
    >
      {isCurrentSong && isPlaying ? (
        <Pause className="w-4 h-4 text-white fill-white transition-transform duration-200 hover:scale-110" />
      ) : (
        <Play className="w-4 h-4 text-white fill-white transition-transform duration-200 hover:scale-110 ml-[2px]" />
      )}
    </Button>
  );
};

export default PlayButton;
