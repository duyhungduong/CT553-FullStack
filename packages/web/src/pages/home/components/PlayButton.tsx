import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

type PlayButtonProps = {
  song: Song;
  songs: Song[];
  className?: string;
};

const PlayButton = ({ song, songs, className }: PlayButtonProps) => {
  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    togglePlay,
    initializeQueue,
  } = usePlayerStore();
  const [isClicked, setIsClicked] = useState(false);
  const isCurrentSong = currentSong?._id === song._id;
  const [isLoading, setIsLoading] = useState(false);
  const { info } = useChatStore();
  const handlePlay = async () => {
    setIsLoading(true);
    setIsClicked(true);

    if (isCurrentSong) {
      togglePlay(info?.clerkId || "");
    } else {
      setCurrentSong(song, info?.clerkId || "");
      initializeQueue(songs, info?.clerkId || "", true);
    }
    setTimeout(() => setIsLoading(false), 300); // Reset loading sau animation
  };
  return (
    <div className="">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-gray-900/30 to-black/40 transition-opacity duration-300 
          ${
            isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } pointer-events-none`}
      />

      {/* Play Button */}
      <Button
        size="icon"
        onClick={handlePlay}
        className={`absolute bottom-4 right-4 bg-gradient-to-r from-sky-400 to-sky-600 
          shadow-md hover:scale-105 transition-all duration-500 ease-in-out
          opacity-0 translate-y-2 group-hover:translate-y-0
          ${isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          ${isLoading ? "animate-pulse" : ""}
          ${
            isClicked
              ? "rounded-full w-12 h-12 -rotate-180"
              : "rounded-[20%] w-12 h-12 [clip-path:polygon(50%_10%,_90%_50%,_50%_90%,_10%_50%)] rotate-0"
          } ${className}`}
      >
        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-200">
          {isCurrentSong && isPlaying ? (
            <Pause className="w-5 h-5 text-white fill-white transition-all duration-200" />
          ) : (
            <Play
              className={`w-5 h-5 text-white fill-white transition-all duration-200 ${
                isClicked ? "-rotate-180" : ""
              }`}
            />
          )}
          {/* Ripple effect khi click */}
          {isLoading && (
            <span className="absolute inset-0 rounded-full bg-sky-400/30 animate-ping" />
          )}
        </div>
      </Button>
    </div>
  );
};

export default PlayButton;
