import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { Ellipsis, ListCheck, ListEnd } from "lucide-react";
// import { useState } from "react";

type DropdownMenuProps = {
  song: Song;
  className?: string;
};
export function DropdownMenuDemo({ song, className }: DropdownMenuProps) {
  const {
    currentSong,
    // isPlaying,
    // setCurrentSong,
    // togglePlay,
    // initializeQueue
  } = usePlayerStore();
  const isCurrentSong = currentSong?._id === song._id;
  console.log("isCurrentSong", isCurrentSong);
  // const [isClicked, setIsClicked] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Ellipsis
          size={20}
          className={`absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors duration-300
            opacity-0 group-hover:opacity-100             ${className}`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg">
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-zinc-700/50 focus:bg-zinc-700/50 text-sm">
            <ListEnd className="mr-2 h-4 w-4" />
            Add to Next Up
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-zinc-700/50 focus:bg-zinc-700/50 text-sm">
            <ListCheck className="mr-2 h-4 w-4" />
            Add to Playlist
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
