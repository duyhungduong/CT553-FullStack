import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import { Card, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { Song, Playlist } from "@/types";
import { AutoSizer } from "react-virtualized";
import { motion } from "framer-motion";

type SectionGridProps = {
  title: string;
  songs: Song[];
  isLoading: boolean;
};

const NewSectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
  const {
    addSongToFavorites,
    removeSongFromFavorites,
    favorites,
    fetchUserFavorites,
    playlists,
    fetchPlaylists,
    addTrackToPlaylist,
  } = useMusicStore();
  const { info } = useChatStore();
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [favoriteStatus, setFavoriteStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [scrollPosition, setScrollPosition] = useState(0); // Vị trí scroll hiện tại

  useEffect(() => {
    if (info?._id) {
      fetchUserFavorites(info._id, 1, 100);
      fetchPlaylists(1, 100);
    }
  }, [info?._id, fetchUserFavorites, fetchPlaylists]);

  useEffect(() => {
    const status = songs.reduce((acc, song) => {
      acc[song._id] = favorites.some((fav) => fav._id === song._id);
      return acc;
    }, {} as { [key: string]: boolean });
    setFavoriteStatus(status);
  }, [favorites, songs]);

  const isFavorite = (songId: string) => favoriteStatus[songId] || false;

  const handleToggleFavorite = async (songId: string) => {
    if (!info?._id) {
      toast.error("Please log in to favorite songs");
      return;
    }

    setLocalLoading((prev) => ({ ...prev, [songId]: true }));
    const isFavorited = favoriteStatus[songId];
    setFavoriteStatus((prev) => ({ ...prev, [songId]: !isFavorited }));

    try {
      if (isFavorite(songId)) {
        await removeSongFromFavorites(info._id, songId);
      } else {
        await addSongToFavorites(info._id, songId);
      }
    } catch (error) {
      setFavoriteStatus((prev) => ({ ...prev, [songId]: isFavorited }));
      toast.error(`Failed to update favorite status: ${error}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [songId]: false }));
    }
  };

  const handleAddToPlaylist = async (playlistId: string, trackId: string) => {
    if (!info?._id) {
      toast.error("Please log in to add songs to playlists");
      return;
    }
    setLocalLoading((prev) => ({ ...prev, [trackId]: true }));
    try {
      await addTrackToPlaylist(playlistId, trackId);
    } catch (error) {
      toast.error(`Failed to add track to playlist: ${error}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [trackId]: false }));
    }
  };

  const isSongInPlaylist = (playlist: Playlist, songId: string): boolean =>
    playlist.tracks?.some((track) => track._id === songId) || false;

  if (isLoading || songs.length === 0) return <SectionGridSkeleton />;

  // Hàm xác định số lượng bài hát dựa trên chiều rộng
  const getItemsPerPage = (width: number) => {
    if (width >= 1024) return 6; // lg
    if (width >= 640) return 3; // md
    if (width >= 360) return 2; // sm
    return 1; // xs
  };

  // Component hiển thị từng bài hát
  const SongCard = ({ song, width }: { song: Song; width: number }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: `${width}px` }}
      className="mx-1"
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-md transition-all duration-300 group cursor-pointer">
            <CardContent className="p-3">
              <div className="relative mb-2">
                <div className="aspect-square rounded-md overflow-hidden shadow-md">
                  <motion.img
                    src={song.imageUrl}
                    alt={song.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <PlayButton song={song} songs={songs} />
              </div>
              <div className="flex justify-between items-center">
                <div className="truncate">
                  <Link
                    to={`/songs/${song._id}`}
                    className="font-medium text-sm text-white truncate hover:underline"
                  >
                    {song.title}
                  </Link>
                  <p className="text-xs text-zinc-400 truncate">
                    {song.artists[0]?.name || "Unknown Artist"}
                  </p>
                </div>
                <Toggle
                  size="sm"
                  variant="default"
                  aria-label="Toggle favorite"
                  pressed={isFavorite(song._id)}
                  onPressedChange={() => handleToggleFavorite(song._id)}
                  disabled={localLoading[song._id]}
                  className="data-[state=on]:text-[#1DB954] transition-all duration-200"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite(song._id) ? "fill-[#1DB954]" : ""
                    }`}
                  />
                </Toggle>
              </div>
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64 bg-zinc-900 border-zinc-800">
          <ContextMenuItem inset className="text-white hover:bg-zinc-800">
            <Link to={`/songs/${song._id}`}>View</Link>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset className="text-white">
              Add to playlists
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 bg-zinc-900 border-zinc-800">
              <ScrollArea className="max-h-60">
                {playlists.length > 0 ? (
                  playlists.map((playlist) => {
                    const isAdded = isSongInPlaylist(playlist, song._id);
                    return (
                      <ContextMenuItem
                        key={playlist._id}
                        onClick={() =>
                          !isAdded &&
                          handleAddToPlaylist(playlist._id, song._id)
                        }
                        disabled={isAdded || localLoading[song._id]}
                        className="text-white hover:bg-zinc-800"
                      >
                        {playlist.title}{" "}
                        {isAdded && (
                          <span className="text-zinc-400 ml-2">(Added)</span>
                        )}
                      </ContextMenuItem>
                    );
                  })
                ) : (
                  <ContextMenuItem disabled className="text-zinc-400">
                    No playlists available
                  </ContextMenuItem>
                )}
              </ScrollArea>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator className="bg-zinc-800" />
          <ContextMenuCheckboxItem
            checked={isFavorite(song._id)}
            onCheckedChange={() => handleToggleFavorite(song._id)}
            className="text-white hover:bg-zinc-800"
          >
            Add to my Favorite
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    </motion.div>
  );

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight hover:underline cursor-pointer">
          {title}
        </h2>
        <Button
          variant="link"
          className="text-sm text-zinc-400 hover:text-white"
          asChild
        >
          <Link to="#">Show all</Link>
        </Button>
      </div>

      <AutoSizer disableHeight>
        {({ width }) => {
          const itemsPerPage = getItemsPerPage(width);
          const totalPages = Math.ceil(songs.length / itemsPerPage);
          const currentSongs = songs.slice(
            scrollPosition * itemsPerPage,
            (scrollPosition + 1) * itemsPerPage
          );
          const cardWidth = Math.max((width - 12 * (itemsPerPage - 1)) / itemsPerPage, 120);
          const visibleSongs =
            currentSongs.length < itemsPerPage
              ? [
                  ...currentSongs,
                  ...Array(itemsPerPage - currentSongs.length).fill(null),
                ]
              : currentSongs;

          const handlePrev = () => {
            if (scrollPosition > 0) {
              setScrollPosition((prev) => prev - 1);
            }
          };

          const handleNext = () => {
            if (scrollPosition < totalPages - 1) {
              setScrollPosition((prev) => prev + 1);
            }
          };

          return (
            <div className="relative" style={{ width: `${width}px` }}>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800"
                onClick={handlePrev}
                disabled={scrollPosition === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div
                className="flex justify-between"
                style={{
                  width: `${width}px`,
                  overflowX: "hidden", // Loại bỏ thanh cuộn ngang
                }}
              >
                {visibleSongs.map((song, index) =>
                  song ? (
                    <SongCard song={song} width={cardWidth} key={song._id} />
                  ) : (
                    <div
                      style={{ width: `${cardWidth}px` }}
                      key={`placeholder-${index}`}
                    />
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800"
                onClick={handleNext}
                disabled={scrollPosition === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default NewSectionGrid;
