import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useChatStore } from "@/stores/useChatStore";
import { Music, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import PlayButton from "../home/components/PlayButton";
import Header from "./components/Header";
import { Toggle } from "@/components/ui/toggle";
import toast from "react-hot-toast";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { DropdownMenuDemo } from "../home/components/DropdownMenu";

const AllSongsPage = () => {
  const {
    songs,
    fetchSongs,
    isLoading,
    error,
    currentPage,
    totalPages,
    songsPerPage,
    // addSongToFavorites,
    // removeSongFromFavorites,
    favorites,
    fetchUserFavorites,
    playlists,
    fetchPlaylists,
    addTrackToPlaylist,
    totalSongs
  } = useMusicStore();
  const { 
    // setCurrentSong, 
    addToQueue } = usePlayerStore();
  const { info } = useChatStore();

  const limit = 20; // Giới hạn 20 bài hát mỗi trang
  const [searchQuery, setSearchQuery] = useState(""); // State cho tìm kiếm
  const [sortBy, setSortBy] = useState<"title" | "artist" | "duration">("title"); // State cho sắp xếp
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>({}); // State cho loading cục bộ
  const libraryRef = useRef<HTMLHeadingElement>(null); // Ref cho h2

  useEffect(() => {
    if (!songs.length) fetchSongs(currentPage, limit);
    if (info?._id) {
      fetchUserFavorites(info._id, 1, 1000);
      fetchPlaylists(1, 100);
    }
  }, [fetchSongs, currentPage, songs, fetchUserFavorites, fetchPlaylists, info?._id]);

  const debouncedFetchSongs = debounce((page: number, limit: number) => {
    fetchSongs(page, limit);
  }, 300);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      debouncedFetchSongs(newPage, songsPerPage);
      setTimeout(() => {
        libraryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const isFavorite = (songId: string) => favorites.some((fav) => fav._id === songId);


  // const handleToggleFavorite = async (songId: string) => {
  //   if (!info?._id) {
  //     toast.error("Please log in to favorite songs");
  //     return;
  //   }
  //   setLocalLoading((prev) => ({ ...prev, [songId]: true }));
  //   const wasFavorited = isFavorite(songId);

  //   try {
  //     if (wasFavorited) {
  //       await removeSongFromFavorites(info._id, songId);
  //     } else {
  //       await addSongToFavorites(info._id, songId);
  //     }
  //     await fetchUserFavorites(info._id, 1, 1000);
  //   } catch (error) {
  //     toast.error(`Failed to update favorite status: ${error}`);
  //   } finally {
  //     setLocalLoading((prev) => ({ ...prev, [songId]: false }));
  //   }
  // };

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

  const handleAddToQueue = async (song: any) => {
    const userId = info?._id;
    if (!userId) {
      toast.error("Please log in to add songs to queue");
      return;
    }
    await addToQueue(song, userId);
  };

  const isSongInPlaylist = (playlist: any, songId: string) =>
    playlist.tracks?.some((track: any) => track._id === songId) || false;

  // Lọc và sắp xếp bài hát dựa trên searchQuery và sortBy
  const filteredSongs = songs
    .filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artists[0]?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "artist")
        return (a.artists[0]?.name || "").localeCompare(b.artists[0]?.name || "");
      if (sortBy === "duration") return a.duration - b.duration;
      return 0;
    });

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 bg-zinc-950">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-lg shadow-md">
        <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
        <Separator orientation="vertical" className="h-6 bg-zinc-800" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-400">
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-500 transition-colors">
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-600" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sky-500 font-semibold">
                <Link to={"/songs"}>Songs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <Header title="All Songs" />
      <ScrollArea className="h-[calc(100vh-184px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative h-[40vh] flex items-center justify-center bg-gradient-to-br from-green-500/20 via-zinc-900 to-black"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
            <div className="relative z-10 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg"
              >
                All Songs
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-2 text-lg text-zinc-300 max-w-2xl"
              >
                Discover {totalSongs} tracks across all genres and artists.
              </motion.p>
            </div>
          </motion.section>

          {/* Songs Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            ref={libraryRef}
            className="container mx-auto px-2 sm:px-4 lg:px-6 py-12 my-1"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Music className="h-6 w-6 text-green-500" /> Your Music Library
              </h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] sm:w-[300px] bg-zinc-800/50 border-zinc-700 text-white rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-[150px] bg-zinc-800/50 border-zinc-700 text-white rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center text-zinc-400">
                <Music className="animate-spin h-6 w-6 text-green-500 inline-block mr-2" />
                Loading songs...
              </div>
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {filteredSongs.map((song, index) => (
                    <motion.div
                      key={song._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden h-full">
                            <CardContent className="p-4 relative">
                              <div className="relative mb-3">
                                <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                  <img
                                    src={song.imageUrl || "https://via.placeholder.com/300x300"}
                                    alt={song.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <PlayButton song={song} songs={songs} className="" />
                                <DropdownMenuDemo song={song} />
                                <Toggle
                                  size="sm"
                                  variant="outline"
                                  aria-label="Toggle favorite"
                                  pressed={isFavorite(song._id)}
                                  // onPressedChange={() => handleToggleFavorite(song._id)}
                                  disabled={localLoading[song._id]}
                                  className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                                >
                                  <Heart
                                    className={`w-5 h-5 ${isFavorite(song._id) ? "fill-[#FA5252]" : ""}`}
                                  />
                                </Toggle>
                              </div>
                              <div className="text-center">
                                <Link
                                  to={`/songs/${song._id}`}
                                  className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                                >
                                  {song.title}
                                </Link>
                                <p className="text-xs text-zinc-400 truncate">
                                  {song.artists[0]?.name || "Unknown Artist"}
                                </p>
                                <div className="flex justify-center items-center gap-2 mt-1 flex-wrap">
                                  {song.genres.slice(0, 2).map((genre) => (
                                    <Badge
                                      key={genre._id}
                                      variant="secondary"
                                      className="bg-zinc-700 cursor-pointer text-zinc-200 text-xs hover:bg-zinc-600 transition-colors duration-200"
                                    >
                                      <Link to={`/genres/${genre._id}`}>#{genre.name}</Link>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-64">
                          <ContextMenuItem inset>
                            <Link to={`/songs/${song._id}`}>View</Link>
                            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                          </ContextMenuItem>
                          <ContextMenuItem inset onClick={() => handleAddToQueue(song)}>
                            Add to Queue
                            <ContextMenuShortcut>⌘Q</ContextMenuShortcut>
                          </ContextMenuItem>
                          <ContextMenuSub>
                            <ContextMenuSubTrigger inset>Add to playlists</ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                              <ScrollArea className="max-h-60">
                                {playlists.length > 0 ? (
                                  playlists.map((playlist) => {
                                    const isAdded = isSongInPlaylist(playlist, song._id);
                                    return (
                                      <ContextMenuItem
                                        key={playlist._id}
                                        onClick={() =>
                                          !isAdded && handleAddToPlaylist(playlist._id, song._id)
                                        }
                                        disabled={isAdded || localLoading[song._id]}
                                      >
                                        {playlist.title}{" "}
                                        {isAdded && (
                                          <span className="text-gray-400 ml-2">(Added)</span>
                                        )}
                                      </ContextMenuItem>
                                    );
                                  })
                                ) : (
                                  <ContextMenuItem disabled>No playlists available</ContextMenuItem>
                                )}
                              </ScrollArea>
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                          <ContextMenuSeparator />
                          <ContextMenuCheckboxItem
                            checked={isFavorite(song._id) || false}
                            // onCheckedChange={() => handleToggleFavorite(song._id)}
                          >
                            Add to my Favorite
                            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
                          </ContextMenuCheckboxItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Thông báo khi không tìm thấy */}
            {!isLoading && filteredSongs.length === 0 && (
              <p className="text-center text-zinc-400 mt-8">No songs match your search.</p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-12">
                <PaginationContent className="bg-zinc-800/50 rounded-full p-2 shadow-md">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }`}
                    />
                  </PaginationItem>

                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                        className="rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                            currentPage === page ? "bg-green-500 text-black" : ""
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                        className="rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                        currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AllSongsPage;