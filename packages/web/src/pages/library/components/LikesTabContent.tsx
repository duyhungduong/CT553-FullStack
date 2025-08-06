import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";

import { ChevronDown, ChevronUp, Heart, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useChatStore } from "@/stores/useChatStore";
import { Playlist, Song } from "@/types";
import PlayButton from "@/pages/home/components/PlayButton";
import { DropdownMenuDemo } from "@/pages/home/components/DropdownMenu";
// import PlayButton from "../home/components/PlayButton";
// import { DropdownMenuDemo } from "../home/components/DropdownMenu";

const LikesTabContent = () => {
  const {
    favorites,
    fetchUserFavorites,
    addSongToFavorites,
    removeSongFromFavorites,
    playlists,
    fetchPlaylists,
    addTrackToPlaylist,
  } = useMusicStore();
  const { setCurrentSong, addToQueue } = usePlayerStore();
  const { info } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>({});
  const INITIAL_DISPLAY_COUNT = 18;

  // Fetch favorites and playlists on mount
  useEffect(() => {
    if (info?._id) {
      fetchUserFavorites(info._id, 1, 1000);
      fetchPlaylists(1, 100);
    }
  }, [info?._id, fetchUserFavorites, fetchPlaylists]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Filter favorites based on search term
  const filteredFavorites = favorites.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle toggle favorite
  const handleToggleFavorite = async (songId: string) => {
    if (!info?._id) {
      toast.error("Please log in to favorite songs");
      return;
    }
    setLocalLoading((prev) => ({ ...prev, [songId]: true }));
    const wasFavorited = favorites.some((fav) => fav._id === songId);

    try {
      if (wasFavorited) {
        await removeSongFromFavorites(info._id, songId);
        // toast.success("Removed from favorites");
      } else {
        await addSongToFavorites(info._id, songId);
        toast.success("Added to favorites");
      }
      await fetchUserFavorites(info._id, 1, 1000);
    } catch (error: any) {
      toast.error(`Failed to update favorite status: ${error.message || "Unknown error"}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [songId]: false }));
    }
  };

  // Handle add to playlist
  const handleAddToPlaylist = async (playlistId: string, trackId: string) => {
    if (!info?._id) {
      toast.error("Please log in to add songs to playlists");
      return;
    }
    setLocalLoading((prev) => ({ ...prev, [trackId]: true }));
    try {
      await addTrackToPlaylist(playlistId, trackId);
      toast.success("Added to playlist!");
    } catch (error: any) {
      toast.error(`Failed to add track to playlist: ${error.message || "Unknown error"}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [trackId]: false }));
    }
  };

  // Handle add to queue
  const handleAddToQueue = async (song: Song) => {
    const userId = info?._id;
    if (!userId) {
      toast.error("Please log in to add songs to queue");
      return;
    }
    await addToQueue(song, userId);
    toast.success(`${song.title} added to queue`);
  };

  // Check if song is in playlist
  const isSongInPlaylist = (playlist: Playlist, songId: string) =>
    playlist.tracks?.some((track) => track._id === songId) || false;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // const headerVariants = {
  //   hidden: { y: -50, opacity: 0 },
  //   visible: {
  //     y: 0,
  //     opacity: 1,
  //     transition: {
  //       duration: 0.5,
  //       ease: "easeOut",
  //     },
  //   },
  // };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full w-full bg-zinc-950 text-white overflow-hidden"
    >
      
      <ScrollArea className="h-[calc(100vh-134px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Hero Section */}
          <motion.section
            variants={containerVariants}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
                  Liked Songs
                </h1>
                <p className="mt-2 text-lg text-zinc-200">
                  Hear the tracks you’ve loved.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full"
                    onClick={() => setCurrentSong(filteredFavorites[0], info?.clerkId || "")}
                    disabled={!filteredFavorites.length}
                  >
                    <Play className="h-5 w-5 mr-2 fill-black" /> Play All
                  </Button>
                  <span className="text-zinc-300">{filteredFavorites.length} songs</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="search"
                  placeholder="Search liked tracks..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="rounded-sm border-zinc-700 bg-zinc-800 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectGroup>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="liked">Liked</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Songs Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
            >
              {filteredFavorites.slice(0, INITIAL_DISPLAY_COUNT).map((song) => (
                <motion.div key={song._id} variants={itemVariants}>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <Card className="rounded-xl bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                        <CardContent className="p-4 relative">
                          <div className="relative mb-3">
                            <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                              <img
                                src={song.imageUrl || "/default-song.jpeg"}
                                alt={song.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 hover:rounded-lg bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PlayButton song={song} songs={filteredFavorites} />
                            </div>
                            <DropdownMenuDemo song={song} />
                            <Toggle
                              size="sm"
                              variant="outline"
                              aria-label="Toggle favorite"
                              pressed={favorites.some((fav) => fav._id === song._id)}
                              onPressedChange={() => handleToggleFavorite(song._id)}
                              disabled={localLoading[song._id]}
                              className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  favorites.some((fav) => fav._id === song._id)
                                    ? "fill-[#FA5252]"
                                    : ""
                                }`}
                              />
                            </Toggle>
                          </div>
                          <div className="text-center truncate">
                            <Link
                              to={`/songs/${song._id}`}
                              className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                            >
                              {song.title}
                            </Link>
                            <p className="text-xs text-zinc-400 truncate">
                              {song.artists[0]?.name || "Unknown Artist"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64 bg-zinc-800 border-zinc-700 text-white">
                      <ContextMenuItem className="hover:bg-zinc-700">
                        <Link to={`/songs/${song._id}`}>View</Link>
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="hover:bg-zinc-700"
                        onClick={() => handleAddToQueue(song)}
                      >
                        Add to Queue
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger className="hover:bg-zinc-700">
                          Add to playlists
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48 bg-zinc-800 border-zinc-700 text-white">
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
                                    className="hover:bg-zinc-700"
                                  >
                                    {playlist.title}
                                    {isAdded && (
                                      <span className="text-gray-400 ml-2">(Added)</span>
                                    )}
                                  </ContextMenuItem>
                                );
                              })
                            ) : (
                              <ContextMenuItem disabled className="text-gray-400">
                                No playlists available
                              </ContextMenuItem>
                            )}
                          </ScrollArea>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSeparator className="bg-zinc-700" />
                      <ContextMenuCheckboxItem
                        checked={favorites.some((fav) => fav._id === song._id)}
                        onCheckedChange={() => handleToggleFavorite(song._id)}
                        className="hover:bg-zinc-700"
                      >
                        Remove from Favorites
                      </ContextMenuCheckboxItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </motion.div>
              ))}
            </motion.div>

            {/* Collapsible Section for Additional Songs */}
            {filteredFavorites.length > INITIAL_DISPLAY_COUNT && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-8">
                <AnimatePresence>
                  {isOpen && (
                    <CollapsibleContent asChild>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-6"
                        >
                          {filteredFavorites.slice(INITIAL_DISPLAY_COUNT).map((song) => (
                            <motion.div key={song._id} variants={itemVariants}>
                              <ContextMenu>
                                <ContextMenuTrigger>
                                  <Card className="rounded-xl bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                                    <CardContent className="p-4 relative">
                                      <div className="relative mb-3">
                                        <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                          <img
                                            src={song.imageUrl || "/default-song.jpeg"}
                                            alt={song.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 hover:rounded-lg bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <PlayButton song={song} songs={filteredFavorites} />
                                        </div>
                                        <DropdownMenuDemo song={song} />
                                        <Toggle
                                          size="sm"
                                          variant="outline"
                                          aria-label="Toggle favorite"
                                          pressed={favorites.some((fav) => fav._id === song._id)}
                                          onPressedChange={() => handleToggleFavorite(song._id)}
                                          disabled={localLoading[song._id]}
                                          className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                                        >
                                          <Heart
                                            className={`w-5 h-5 ${
                                              favorites.some((fav) => fav._id === song._id)
                                                ? "fill-[#FA5252]"
                                                : ""
                                            }`}
                                          />
                                        </Toggle>
                                      </div>
                                      <div className="text-center truncate">
                                        <Link
                                          to={`/songs/${song._id}`}
                                          className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                                        >
                                          {song.title}
                                        </Link>
                                        <p className="text-xs text-zinc-400 truncate">
                                          {song.artists[0]?.name || "Unknown Artist"}
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-64 bg-zinc-800 border-zinc-700 text-white">
                                  <ContextMenuItem className="hover:bg-zinc-700">
                                    <Link to={`/songs/${song._id}`}>View</Link>
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    className="hover:bg-zinc-700"
                                    onClick={() => handleAddToQueue(song)}
                                  >
                                    Add to Queue
                                  </ContextMenuItem>
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger className="hover:bg-zinc-700">
                                      Add to playlists
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48 bg-zinc-800 border-zinc-700 text-white">
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
                                                className="hover:bg-zinc-700"
                                              >
                                                {playlist.title}
                                                {isAdded && (
                                                  <span className="text-gray-400 ml-2">
                                                    (Added)
                                                  </span>
                                                )}
                                              </ContextMenuItem>
                                            );
                                          })
                                        ) : (
                                          <ContextMenuItem disabled className="text-gray-400">
                                            No playlists available
                                          </ContextMenuItem>
                                        )}
                                      </ScrollArea>
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                  <ContextMenuSeparator className="bg-zinc-700" />
                                  <ContextMenuCheckboxItem
                                    checked={favorites.some((fav) => fav._id === song._id)}
                                    onCheckedChange={() => handleToggleFavorite(song._id)}
                                    className="hover:bg-zinc-700"
                                  >
                                    Remove from Favorites
                                  </ContextMenuCheckboxItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
                <CollapsibleTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex justify-center mt-6"
                  >
                    <Button
                      variant="outline"
                      className="group relative px-6 py-2 bg-zinc-900/50 text-zinc-200 border-zinc-700 rounded-full shadow-md hover:bg-zinc-800/80 hover:text-white transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isOpen ? (
                          <>
                            Show Less
                            <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                          </>
                        ) : (
                          <>
                            Show More ({filteredFavorites.length - INITIAL_DISPLAY_COUNT})
                            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                          </>
                        )}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-sky-500/20 opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                </CollapsibleTrigger>
              </Collapsible>
            )}

            {filteredFavorites.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center text-zinc-400 mt-8 col-span-full"
              >
                No liked tracks found matching your search.
              </motion.p>
            )}
          </motion.section>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default LikesTabContent;