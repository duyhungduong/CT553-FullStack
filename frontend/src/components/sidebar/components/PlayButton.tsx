import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { Pause, Play } from "lucide-react";


type PlayButtonProps = {
  song: Song;
};

const PlayButton = ({ song}: PlayButtonProps) => {
    const {
        currentSong,
        isPlaying,
        setCurrentSong,
        togglePlay,
      } = usePlayerStore();
      const isCurrentSong = currentSong?._id === song._id;
    
      const {userId} = useAuth();
      const handlePlay = () => {
        if (isCurrentSong) togglePlay(userId || "");
        else {setCurrentSong(song, userId || "");
        //   initializeQueue(songs);
        }
      };
  return (
    <Button
      size="icon"
      onClick={handlePlay}
      className={`absolute bottom-1 right-4 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full shadow-md hover:scale-110 
				transition-all duration-300 opacity-0 translate-y-2 group-hover:translate-y-0 ${
          isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
    >
      {isCurrentSong && isPlaying ? (
        <Pause className="w-2 h-2 text-white" />
      ) : (
        <Play className="w-2 h-2 text-white" />
      )}
    </Button>
  )
}

export default PlayButton