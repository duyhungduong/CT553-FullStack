import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatStore } from "@/stores/useChatStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddToFavorite = ({ songId }: { songId: string }) => {
  const {
    addSongToFavorites,
    removeSongFromFavorites,
    favorites,
    fetchUserFavorites,
    fetchPlaylists,
  } = useMusicStore();
  const { info } = useChatStore();
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch user favorites and playlists on mount
  useEffect(() => {
    if (info?._id) {
      fetchUserFavorites(info._id,1,1000);
      fetchPlaylists();
    }
  }, [info?._id, fetchUserFavorites, fetchPlaylists]);

  // Sync isFavorited with favorites from store
  useEffect(() => {
    const favorited = favorites.some((fav) => fav._id === songId);
    setIsFavorited(favorited);
  }, [favorites, songId]);

  // Trong AddToFavorite.tsx
const handleToggleFavorite = async () => {
  if (!info?._id) {
    toast.error("Please log in to favorite songs");
    return;
  }
  const wasFavorited = isFavorited;
  setIsFavorited(!wasFavorited);
  try {
    if (wasFavorited) {
      await removeSongFromFavorites(info._id, songId);
    } else {
      await addSongToFavorites(info._id, songId);
    }
    await fetchUserFavorites(info._id, 1, 1000); // Đồng bộ lại
  } catch (error: any) {
    setIsFavorited(wasFavorited);
    toast.error(`Failed to update favorite status: ${error.message || "Unknown error"}`);
  }
};

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            variant="default"
            size="sm"
            aria-label="Toggle favorite"
            className="data-[state=on]:text-[#FA5252] transition-all duration-200 data-[state=off]:text-black data-[state=on]:bg-inherit focus:shadow-black"
            pressed={isFavorited}
            onPressedChange={handleToggleFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-[#FA5252]" : ""}`} />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFavorited ? "Remove from favorites" : "Add to favorites"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddToFavorite;