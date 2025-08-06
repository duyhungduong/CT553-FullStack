import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

type PlayButtonProps = {
  song: Song;
  songs: Song[];
};

const PlayButton = ({ song, songs }: PlayButtonProps) => {
  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    togglePlay,
    initializeQueue,
  } = usePlayerStore();
  const [isClicked, setIsClicked] = useState(false);
  const isCurrentSong = currentSong?._id === song._id;

  const {info} = useChatStore();
  const handlePlay = () => {
    setIsClicked(true);
    if (isCurrentSong) togglePlay(info?.clerkId || "");
    else {
      setCurrentSong(song, info?.clerkId || "");
      initializeQueue(songs, info?.clerkId || "", true);
    }
  };

  return (
    <div className="">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 
          ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          pointer-events-none`} // Thêm pointer-events-none
      />
      
      {/* Play Button */}
      <Button
        size="icon"
        onClick={handlePlay}
        className={`absolute bottom-4 right-4 bg-gradient-to-r from-sky-400 to-sky-600 
          shadow-md hover:scale-105 transition-all duration-500 ease-in-out
          opacity-0 translate-y-2 group-hover:translate-y-0
          ${isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          ${isClicked 
            ? "rounded-full w-12 h-12 -rotate-180" 
            : "rounded-[20%] w-12 h-12 [clip-path:polygon(50%_10%,_90%_50%,_50%_90%,_10%_50%)] rotate-0"
          }`}
      >
        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-200">
          {isCurrentSong && isPlaying ? (
            <Pause className="w-5 h-5 text-white fill-white transition-all duration-200" />
          ) : (
            <Play className={`w-5 h-5 text-white fill-white transition-all duration-200 ${isClicked 
              ? "-rotate-180" 
              : ""
            }` } />
          )}
        </div>
      </Button>
    </div>
  );
};

export default PlayButton;