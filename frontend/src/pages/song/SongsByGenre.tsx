import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useChatStore } from "@/stores/useChatStore";
import { Heart, Music, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
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
  ContextMenuSubContent,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Playlist, Song } from "@/types";
import PlayButton from "../home/components/PlayButton";
import { DropdownMenuDemo } from "../home/components/DropdownMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SongsByGenre = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const {
    fetchSongByGenres,
    songByGenres,
    isLoading,
    genres,
    fetchGenres,
    addSongToFavorites,
    removeSongFromFavorites,
    favorites,
    fetchUserFavorites,
    playlists,
    fetchPlaylists,
    addTrackToPlaylist,
  } = useMusicStore();
  const { setCurrentSong, addToQueue } = usePlayerStore();
  const { info } = useChatStore();

  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>({});
  const [favoriteStatus, setFavoriteStatus] = useState<{ [key: string]: boolean }>({});
  const [isOpen, setIsOpen] = useState(false);
  const INITIAL_DISPLAY_COUNT = 18;

  useEffect(() => {
    if (genreId) {
      fetchSongByGenres(genreId, 1, 200);
      if (!genres.length) fetchGenres();
    }
    if (info?._id) {
      fetchUserFavorites(info._id, 1, 1000);
      fetchPlaylists(1, 100);
    }
  }, [genreId, fetchSongByGenres, fetchGenres, genres.length, fetchUserFavorites, fetchPlaylists, info?._id]);

  useEffect(() => {
    const status = songByGenres.reduce((acc, song) => {
      acc[song._id] = favorites.some((fav) => fav._id === song._id);
      return acc;
    }, {} as { [key: string]: boolean });
    setFavoriteStatus(status);
  }, [favorites, songByGenres]);

  const currentGenre = genres.find((g) => g._id === genreId);

  const isFavorite = (songId: string) => favorites.some((fav) => fav._id === songId);

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
      toast.success("Added to playlist!");
    } catch (error) {
      toast.error(`Failed to add track to playlist: ${error}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [trackId]: false }));
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

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  if (isLoading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex items-center justify-center text-white bg-zinc-950"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-2"
        >
          <Music className="h-6 w-6 text-green-500" />
          <span>Loading...</span>
        </motion.div>
      </motion.div>
    );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full w-full bg-zinc-950 text-white overflow-hidden"
    >
      {/* Header */}
      <motion.header
        variants={headerVariants}
        className="sticky top-0 z-30 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-lg shadow-md"
      >
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
              <BreadcrumbLink className="hover:text-sky-500 transition-colors">
                <Link to={"/genres"}>Genres</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-600" />
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="text-sky-500 font-semibold">
                <Link to={`/genres/${currentGenre?._id}`}>
                  {currentGenre?.name || "Genre"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.header>

      <ScrollArea className="h-[calc(100vh-134px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Genre Hero Section */}
          <motion.section
            variants={heroVariants}
            className="relative h-[60vh] flex items-end pb-12 bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                currentGenre?.imageUrl || "https://via.placeholder.com/1920x1080"
              })`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            <motion.div
              variants={containerVariants}
              className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8"
            >
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg"
              >
                {currentGenre?.name || "Unknown Genre"}
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-2 text-lg text-zinc-200 max-w-2xl"
              >
                {currentGenre?.description || "Explore the best tracks in this genre."}
              </motion.p>
              <motion.div variants={itemVariants} className="mt-4 flex items-center gap-4">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full"
                  onClick={() => setCurrentSong(songByGenres[0], info?.clerkId || "")}
                  disabled={!songByGenres.length}
                >
                  <Play className="h-5 w-5 mr-2 fill-black" /> Play All
                </Button>
                <span className="text-zinc-300">{songByGenres.length} songs</span>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Songs Section */}
          <motion.div
            variants={containerVariants}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold mb-8 text-white flex items-center gap-3"
            >
              <Music className="h-6 w-6 text-green-500" /> All Songs
            </motion.h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
            >
              {songByGenres.slice(0, INITIAL_DISPLAY_COUNT).map((song) => (
                <motion.div key={song._id} variants={itemVariants}>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <Card className="rounded-xl bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                        <CardContent className="p-4 relative">
                          <div className="relative mb-3">
                            <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                              <img
                                src={song.imageUrl}
                                alt={song.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 hover:rounded-lg bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PlayButton song={song} songs={songByGenres} />
                            </div>
                            <DropdownMenuDemo song={song} />
                            <Toggle
                              size="sm"
                              variant="outline"
                              aria-label="Toggle favorite"
                              pressed={isFavorite(song._id)}
                              onPressedChange={() => handleToggleFavorite(song._id)}
                              disabled={localLoading[song._id]}
                              className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                            >
                              <Heart
                                className={`w-5 h-5 ${isFavorite(song._id) ? "fill-[#FA5252]" : ""}`}
                              />
                            </Toggle>
                          </div>
                          <div className="text-center truncate">
                            <Link
                              to={`/songs/${song._id}`}
                              className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate"
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
                        onCheckedChange={() => handleToggleFavorite(song._id)}
                      >
                        Add to my Favorite
                        <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
                      </ContextMenuCheckboxItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </motion.div>
              ))}
            </motion.div>
            {songByGenres.length > INITIAL_DISPLAY_COUNT && (
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
                          {songByGenres.slice(INITIAL_DISPLAY_COUNT).map((song) => (
                            <motion.div key={song._id} variants={itemVariants}>
                              <ContextMenu>
                                <ContextMenuTrigger>
                                  <Card className="rounded-xl bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                                    <CardContent className="p-4 relative">
                                      <div className="relative mb-3">
                                        <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                          <img
                                            src={song.imageUrl}
                                            alt={song.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 hover:rounded-lg bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <PlayButton song={song} songs={songByGenres} />
                                        </div>
                                        <DropdownMenuDemo song={song} />
                                        <Toggle
                                          size="sm"
                                          variant="outline"
                                          aria-label="Toggle favorite"
                                          pressed={isFavorite(song._id)}
                                          onPressedChange={() => handleToggleFavorite(song._id)}
                                          disabled={localLoading[song._id]}
                                          className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                                        >
                                          <Heart
                                            className={`w-5 h-5 ${isFavorite(song._id) ? "fill-[#FA5252]" : ""}`}
                                          />
                                        </Toggle>
                                      </div>
                                      <div className="text-center truncate">
                                        <Link
                                          to={`/songs/${song._id}`}
                                          className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate"
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
                                    onCheckedChange={() => handleToggleFavorite(song._id)}
                                  >
                                    Add to my Favorite
                                    <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
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
                            Show More ({songByGenres.length - INITIAL_DISPLAY_COUNT})
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

            {songByGenres.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center text-zinc-400 mt-8"
              >
                No songs found in this genre.
              </motion.p>
            )}
          </motion.div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default SongsByGenre;