// import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { TrendingUp, Clock, Music, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import Header from "./components/Header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Heart } from "lucide-react";
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
// import PlayButton from "./PlayButton"; // Giả sử bạn đã có PlayButton
// import { DropdownMenuDemo } from "./DropdownMenu"; // Giả sử bạn đã có DropdownMenuDemo
import { Playlist, Song } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import PlayButton from "../home/components/PlayButton";
import { DropdownMenuDemo } from "../home/components/DropdownMenu";
import { motion, AnimatePresence } from "framer-motion";

const ExplorePage = () => {
  const {
    fetchFeaturedSongs,
    fetchTrendingSongs,
    fetchGenres,
    fetchRecentSongs,
    fetchMadeForYouSongs,
    featuredSongs,
    trendingSongs,
    genres,
    recentSongs,
    madeForYouSongs,
    isLoading,
    addSongToFavorites,
    removeSongFromFavorites,
    favorites,
    fetchUserFavorites,
    playlists,
    fetchPlaylists,
    addTrackToPlaylist,
    instruments,
    fetchInstruments,
  } = useMusicStore();
  const { 
    // setCurrentSong,
     addToQueue } = usePlayerStore();
  const { info } = useChatStore(); // Giả sử bạn có useChatStore để lấy info user

  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [favoriteStatus, setFavoriteStatus] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchFeaturedSongs();
    fetchTrendingSongs(1, 10);
    fetchGenres();
    fetchInstruments();
    fetchRecentSongs(1, 6);
    fetchMadeForYouSongs();
    if (info?._id) {
      fetchUserFavorites(info._id, 1, 100);
      fetchPlaylists(1, 100);
    }
  }, [
    fetchFeaturedSongs,
    fetchTrendingSongs,
    fetchGenres,
    fetchInstruments,
    fetchRecentSongs,
    fetchMadeForYouSongs,
    fetchUserFavorites,
    fetchPlaylists,
    info?._id,
  ]);

  useEffect(() => {
    const status = [
      ...featuredSongs,
      ...trendingSongs,
      ...recentSongs,
      ...madeForYouSongs,
    ].reduce((acc, song) => {
      acc[song._id] = favorites.some((fav) => fav._id === song._id);
      return acc;
    }, {} as { [key: string]: boolean });
    setFavoriteStatus(status);
  }, [favorites, featuredSongs, trendingSongs, recentSongs, madeForYouSongs]);

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full flex items-center justify-center text-white bg-zinc-900"
      >
        <div className="flex items-center gap-2">
          <Music className="animate-spin h-6 w-6 text-green-500" />
          <span>Loading...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full w-full bg-zinc-950 text-white overflow-hidden"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="sticky top-0 z-30 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-lg shadow-md"
      >
        <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
        <Separator orientation="vertical" className="h-6 bg-zinc-800" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-400">
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="hover:text-sky-500 transition-colors"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-600" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/explore"
                className="text-sky-500 font-semibold"
              >
                Explore
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.header>

      <ScrollArea className="h-[calc(100vh-104px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-[75vh] flex items-center justify-center bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center z-10"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                Discover New Music
              </h1>
              <p className="mt-2 text-lg text-zinc-300 max-w-md mx-auto">
                Explore trending hits, fresh releases, and personalized picks
                just for you.
              </p>
            </motion.div>
          </motion.section>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            {/* Browse Genres */}
            <motion.section variants={containerVariants}>
              <motion.h2
                variants={itemVariants}
                className="text-4xl font-bold mb-6 text-white"
              >
                Browse Genres
              </motion.h2>
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {genres.slice(6, 18).map((genre) => (
                    <motion.div key={genre._id} variants={itemVariants}>
                      <Link
                        to={`/genres/${genre._id}`}
                        className="relative h-20 rounded-xl overflow-hidden group shadow-lg"
                      >
                        <motion.img
                          src={
                            genre.imageUrl || "https://via.placeholder.com/400"
                          }
                          alt={genre.name}
                          className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-all duration-500"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 group-hover:scale-110 to-transparent" />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-white text-xl font-bold drop-shadow-md">
                            {genre.name}
                          </span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.section>

            {/* Browse Instruments */}
            <motion.section variants={containerVariants}>
              <h2 className="text-4xl font-bold mb-6 text-white">
                Browse Musical instruments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {instruments.slice(6, 18).map((genre) => (
                  <Link
                    key={genre._id}
                    to={`/instruments/${genre._id}`}
                    className="relative h-60 rounded-xl overflow-hidden group shadow-lg"
                  >
                    <img
                      src={genre.imageUrl || "https://via.placeholder.com/400"}
                      alt={genre.name}
                      className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xl font-bold drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                        {genre.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Featured Songs */}
            <motion.section variants={containerVariants}>
              <motion.h2 className="text-4xl font-bold mb-6 flex items-center gap-3 text-white">
                <Star className="h-8 w-8 text-yellow-400" /> Featured Today
              </motion.h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {featuredSongs.slice(0, 6).map((song) => (
                  <ContextMenu key={song._id}>
                    <ContextMenuTrigger>
                      <Card className="rounded-xl hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
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
                              <PlayButton song={song} songs={featuredSongs} />
                            </div>
                            <DropdownMenuDemo song={song} />
                            <Toggle
                              size="sm"
                              variant="outline"
                              aria-label="Toggle favorite"
                              pressed={isFavorite(song._id)}
                              onPressedChange={() =>
                                handleToggleFavorite(song._id)
                              }
                              disabled={localLoading[song._id]}
                              className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  isFavorite(song._id) ? "fill-[#FA5252]" : ""
                                }`}
                              />
                            </Toggle>
                          </div>
                          <div className="truncate">
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
                      <ContextMenuItem
                        inset
                        onClick={() => handleAddToQueue(song)}
                      >
                        Add to Queue
                        <ContextMenuShortcut>⌘Q</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger inset>
                          Add to playlists
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
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
                                      !isAdded &&
                                      handleAddToPlaylist(
                                        playlist._id,
                                        song._id
                                      )
                                    }
                                    disabled={isAdded || localLoading[song._id]}
                                  >
                                    {playlist.title}{" "}
                                    {isAdded && (
                                      <span className="text-gray-400 ml-2">
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
                ))}
              </div>
            </motion.section>

            {/* Trending Songs */}
            <section>
              <h2 className="text-4xl font-bold mb-6 flex items-center gap-3 text-white">
                <TrendingUp className="h-8 w-8 text-green-500" /> Trending Now
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {trendingSongs.slice(0, 6).map((song) => (
                  <ContextMenu key={song._id}>
                    <ContextMenuTrigger>
                      <Card className="rounded-xl hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
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
                              <PlayButton song={song} songs={trendingSongs} />
                            </div>
                            <DropdownMenuDemo song={song} />
                            <Toggle
                              size="sm"
                              variant="outline"
                              aria-label="Toggle favorite"
                              pressed={isFavorite(song._id)}
                              onPressedChange={() =>
                                handleToggleFavorite(song._id)
                              }
                              disabled={localLoading[song._id]}
                              className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  isFavorite(song._id) ? "fill-[#FA5252]" : ""
                                }`}
                              />
                            </Toggle>
                          </div>
                          <div className="truncate">
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
                      <ContextMenuItem
                        inset
                        onClick={() => handleAddToQueue(song)}
                      >
                        Add to Queue
                        <ContextMenuShortcut>⌘Q</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger inset>
                          Add to playlists
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
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
                                      !isAdded &&
                                      handleAddToPlaylist(
                                        playlist._id,
                                        song._id
                                      )
                                    }
                                    disabled={isAdded || localLoading[song._id]}
                                  >
                                    {playlist.title}{" "}
                                    {isAdded && (
                                      <span className="text-gray-400 ml-2">
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
                ))}
              </div>
              <Link
                to="/trending"
                className="text-sm text-green-400 hover:text-green-300 mt-4 inline-block transition-colors"
              >
                See all trending songs
              </Link>
            </section>

            {/* New Releases */}
            <section>
              <h2 className="text-4xl font-bold mb-6 flex items-center gap-3 text-white">
                <Clock className="h-8 w-8 text-blue-400" /> New Releases
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {recentSongs.slice(0, 6).map((song) => (
                  <ContextMenu key={song._id}>
                    <ContextMenuTrigger>
                      <Card className="rounded-xl hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
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
                              <PlayButton song={song} songs={recentSongs} />
                            </div>
                            <DropdownMenuDemo song={song} />
                            <Toggle
                              size="sm"
                              variant="outline"
                              aria-label="Toggle favorite"
                              pressed={isFavorite(song._id)}
                              onPressedChange={() =>
                                handleToggleFavorite(song._id)
                              }
                              disabled={localLoading[song._id]}
                              className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  isFavorite(song._id) ? "fill-[#FA5252]" : ""
                                }`}
                              />
                            </Toggle>
                          </div>
                          <div className="truncate">
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
                      <ContextMenuItem
                        inset
                        onClick={() => handleAddToQueue(song)}
                      >
                        Add to Queue
                        <ContextMenuShortcut>⌘Q</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger inset>
                          Add to playlists
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
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
                                      !isAdded &&
                                      handleAddToPlaylist(
                                        playlist._id,
                                        song._id
                                      )
                                    }
                                    disabled={isAdded || localLoading[song._id]}
                                  >
                                    {playlist.title}{" "}
                                    {isAdded && (
                                      <span className="text-gray-400 ml-2">
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
                ))}
              </div>
            </section>

            {/* Made For You */}
            <section>
              <h2 className="text-4xl font-bold mb-6 text-white">
                Made For You
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {madeForYouSongs.slice(0, 6).map((song) => (
                  <ContextMenu key={song._id}>
                    <ContextMenuTrigger>
                      <Card className="rounded-xl hover:bg-zinc-700/90 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
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
                              <PlayButton song={song} songs={madeForYouSongs} />
                            </div>
                            <DropdownMenuDemo song={song} />
                            <Toggle
                              size="sm"
                              variant="outline"
                              aria-label="Toggle favorite"
                              pressed={isFavorite(song._id)}
                              onPressedChange={() =>
                                handleToggleFavorite(song._id)
                              }
                              disabled={localLoading[song._id]}
                              className="absolute top-3 left-3 text-zinc-400 data-[state=on]:text-[#FA5252] hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  isFavorite(song._id) ? "fill-[#FA5252]" : ""
                                }`}
                              />
                            </Toggle>
                          </div>
                          <div className="truncate">
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
                      <ContextMenuItem
                        inset
                        onClick={() => handleAddToQueue(song)}
                      >
                        Add to Queue
                        <ContextMenuShortcut>⌘Q</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger inset>
                          Add to playlists
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
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
                                      !isAdded &&
                                      handleAddToPlaylist(
                                        playlist._id,
                                        song._id
                                      )
                                    }
                                    disabled={isAdded || localLoading[song._id]}
                                  >
                                    {playlist.title}{" "}
                                    {isAdded && (
                                      <span className="text-gray-400 ml-2">
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
                ))}
              </div>
            </section>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default ExplorePage;
