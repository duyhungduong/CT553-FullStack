import { Song, Playlist } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import { Card, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Heart } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenuDemo } from "./DropdownMenu";
import { useAuth } from "@clerk/clerk-react";

type SectionGridProps = {
  title: string;
  songs: Song[];
  isLoading?: boolean;
  itemsPerPage?: number;
};

const SectionGrid = ({
  songs,
  title,
  isLoading = false,
  itemsPerPage = 6,
}: SectionGridProps) => {
  const {
    addSongToFavorites,
    removeSongFromFavorites,
    favorites,
    fetchUserFavorites,
    playlists,
    fetchPlaylists,
    addTrackToPlaylist,
    // isLoading,
  } = useMusicStore();
  const { info } = useChatStore();
  const { addToQueue } = usePlayerStore();
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [favoriteStatus, setFavoriteStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const {userId} = useAuth();

  // Tính toán phân trang
  const totalPages = Math.ceil(songs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSongs = songs.slice(startIndex, endIndex);

  useEffect(() => {
    if (userId) {
      if (info?._id){
        fetchUserFavorites(info._id, 1, 1000);
      fetchPlaylists(1, 100);
      }
    }
  }, [userId, info?._id, fetchUserFavorites, fetchPlaylists]);

  useEffect(() => {
    const status = songs.reduce((acc, song) => {
      acc[song._id] = favorites.some((fav) => fav._id === song._id);
      return acc;
    }, {} as { [key: string]: boolean });
    setFavoriteStatus(status);
  }, [favorites, songs]);

  const isFavorite = (songId: string) =>
    favorites.some((fav) => fav._id === songId);

  const handleToggleFavorite = async (songId: string) => {
    if (!info?._id) {
      toast.error("Please log in to favorite songs");
      return;
    }
    setLocalLoading((prev) => ({ ...prev, [songId]: true }));
    const isFavorited = favoriteStatus[songId];
    setFavoriteStatus((prev) => ({ ...prev, [songId]: !isFavorited }));
    const wasFavorited = isFavorite(songId);

    try {
      if (wasFavorited) {
        await removeSongFromFavorites(info._id, songId);
        // toast.success("Removed from favorites");
      } else {
        await addSongToFavorites(info._id, songId);
        // toast.success("Added to favorites");
      }
    } catch (error) {
      setFavoriteStatus((prev) => ({ ...prev, [songId]: isFavorited }));
      toast.error(`Failed to update favorite status: ${error}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [songId]: false }));
    }
  };

  const handleAddToQueue = async (song: Song) => {
    const userId = info?._id;
    if (!userId) {
      toast.error("Please log in to add songs to queue");
      return;
    }
    await addToQueue(song, userId);
    toast.success(`${song.title} added to queue`);
  };

  const isSongInPlaylist = (playlist: Playlist, songId: string): boolean =>
    playlist.tracks?.some((track) => track._id === songId) || false;

  const handleAddToPlaylist = async (playlistId: string, trackId: string) => {
    if (!info?._id) {
      toast.error("Please log in to add songs to playlists");
      return;
    }
    setLocalLoading((prev) => ({ ...prev, [trackId]: true }));
    try {
      await addTrackToPlaylist(playlistId, trackId);
      // Không cần kiểm tra lỗi trùng lặp nữa
    } catch (error) {
      toast.error(`Failed to add track to playlist: ${error}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [trackId]: false }));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // if (isLoading) return <SectionGridSkeleton />;
  if ( songs.length === 0) return <SectionGridSkeleton />;

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight font-outfit">
          {title}
        </h2>
        <Button
          variant="link"
          className="text-sm text-zinc-400 hover:text-sky-500 transition-colors"
          asChild
        >
          <Link to="/songs">Show all</Link>
        </Button>
      </div>

      {/* Grid */}
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <AnimatePresence mode="wait">
            {paginatedSongs.map((song, index) => (
              <motion.div
                key={`${song._id}-${currentPage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ContextMenu>
                  <ContextMenuTrigger>
                    <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4 relative">
                        {/* Image */}
                        <div className="relative mb-3">
                          <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                            <img
                              src={song.imageUrl}
                              alt={song.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <PlayButton
                            song={song}
                            songs={songs}
                            // className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-green-500 hover:bg-green-400 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                          <Toggle
                            size="sm"
                            variant="outline"
                            pressed={isFavorite(song._id)}
                            onPressedChange={() =>
                              handleToggleFavorite(song._id)
                            }
                            disabled={localLoading[song._id]}
                            className="absolute top-3 left-3 bg-zinc-800/80 text-zinc-400 data-[state=on]:text-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                isFavorite(song._id) ? "fill-rose-500" : ""
                              }`}
                            />
                          </Toggle>
                          <DropdownMenuDemo song={song} />
                        </div>

                        {/* Info */}
                        <div className="text-center truncate">
                          <Link
                            to={`/songs/${song._id}`}
                            className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                          >
                            {song.title}
                          </Link>
                          <Link
                            to={`/artists/${song.artists?.[0]?._id || ""}`}
                            className="text-xs text-zinc-400 hover:text-sky-400 transition-colors duration-200 truncate block"
                          >
                            {song.artists?.[0]?.name || "Unknown Artist"}
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64 bg-zinc-800 border-zinc-700 text-white">
                    <ContextMenuItem className="hover:bg-zinc-700">
                      <Link to={`/songs/${song._id}`}>View Details</Link>
                    </ContextMenuItem>
                    <ContextMenuItem
                      className="hover:bg-zinc-700"
                      onClick={() => handleAddToQueue(song)}
                    >
                      Add to Queue
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger className="hover:bg-zinc-700">
                        Add to Playlist
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-48 bg-zinc-800 border-zinc-700 text-white">
                        <ScrollArea className="max-h-60">
                          {playlists.length > 0 ? (
                            playlists.map((playlist) => {
                              const isAdded = isSongInPlaylist(
                                playlist,
                                song._id
                              );
                              return (
                                <ContextMenuItem
                                  key={playlist._id}
                                  onClick={() =>
                                    handleAddToPlaylist(playlist._id, song._id)
                                  }
                                  disabled={localLoading[song._id]} // Chỉ disable khi đang loading
                                  className="hover:bg-zinc-700"
                                >
                                  {playlist.title}
                                  {isAdded && (
                                    <span className="ml-2 text-zinc-400">
                                      (Added)
                                    </span>
                                  )}
                                </ContextMenuItem>
                              );
                            })
                          ) : (
                            <ContextMenuItem disabled>
                              No playlists available
                            </ContextMenuItem>
                          )}
                        </ScrollArea>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSeparator className="bg-zinc-700" />
                    <ContextMenuCheckboxItem
                      checked={isFavorite(song._id)}
                      onCheckedChange={() => handleToggleFavorite(song._id)}
                      className="hover:bg-zinc-700"
                    >
                      Favorite
                    </ContextMenuCheckboxItem>
                  </ContextMenuContent>
                </ContextMenu>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`${
                    currentPage === page
                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                  }`}
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </Button>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionGrid;
