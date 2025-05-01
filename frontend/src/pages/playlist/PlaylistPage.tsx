import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatDuration } from "@/utils/formatDuration";
import {
  Clock,
  Heart,
  Pause,
  Play,
  // Share2,
  Trash2,
  // GripVertical,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { extractColors } from "extract-colors";
import { useAuth } from "@clerk/clerk-react";
import { Playlist } from "@/types";
import ShareSongDialog from "../song/components/ShareSongDialog";

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const { getPlaylistById, currentPlaylist, removeTrackFromPlaylist } =
    useMusicStore();
  const { currentSong, isPlaying, togglePlay, playbackPosition, playPlaylist } =
    usePlayerStore();

  const [isLiked, setIsLiked] = useState(false);
  const [gradient, setGradient] = useState<{ from: string; to: string }>({
    from: "#F59E0B",
    to: "#1E293B",
  });
  const [tempPlaylist, setTempPlaylist] = useState<Playlist | null>(null);

  const { userId } = useAuth();

  useEffect(() => {
    if (playlistId) {
      if (playlistId.startsWith("daily-mix")) {
        const storedMixes = JSON.parse(
          localStorage.getItem("dailyMixes") || "[]"
        );
        const mix = storedMixes.find((m: Playlist) => m._id === playlistId);
        if (mix) setTempPlaylist(mix);
      } else {
        getPlaylistById(playlistId);
      }
    }
  }, [getPlaylistById, playlistId]);

  const extractGradient = useCallback(async (imageUrl: string) => {
    try {
      const colors = await extractColors(imageUrl);
      if (colors.length >= 2) {
        setGradient({ from: colors[0].hex, to: colors[1].hex });
      } else if (colors.length === 1) {
        setGradient({ from: colors[0].hex, to: "#1E293B" });
      }
    } catch (error) {
      console.error("Error extracting colors:", error);
    }
  }, []);

  useEffect(() => {
    const playlist = tempPlaylist || currentPlaylist;
    if (playlist?.imageUrl) {
      extractGradient(playlist.imageUrl);
    }
  }, [currentPlaylist, tempPlaylist, extractGradient]);

  const handlePlayPlaylist = () => {
    const playlist = tempPlaylist || currentPlaylist;
    if (!playlist?.tracks?.length) return;
    const isCurrentPlaylistPlaying = playlist.tracks.some(
      (song) => song._id === currentSong?._id
    );
    if (isCurrentPlaylistPlaying) togglePlay(userId || "");
    else playPlaylist(playlist.tracks, userId || "", 0, playlist._id);
  };

  const handlePlaySong = (index: number) => {
    const playlist = tempPlaylist || currentPlaylist;
    if (!playlist?.tracks?.length) return;
    if (currentSong?._id === playlist.tracks[index]._id) {
      togglePlay(userId || "");
    } else {
      playPlaylist(playlist.tracks, userId || "", index, playlist._id);
    }
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleRemoveTrack = (trackId: string) => {
    if (playlistId && !playlistId.startsWith("daily-mix")) {
      removeTrackFromPlaylist(playlistId, trackId);
    }
  };

  const playlist = tempPlaylist || currentPlaylist;
  const totalDuration = (playlist?.tracks || []).reduce(
    (sum, track) => sum + (track.duration || 0),
    0
  );

  if (!playlist || !playlistId) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-900">
        Playlist not found
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-lg shadow-md">
        <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
        <Separator orientation="vertical" className="h-6 bg-zinc-700" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-300">
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={`/`}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={`/playlists`}>Playlists</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={`/playlists/${playlistId}`}>{playlist.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ScrollArea className="h-[calc(100vh-120px)]">
        {/* Playlist Header Section */}
        <section
          className="relative"
          style={{
            background: `linear-gradient(to bottom right, ${gradient.from}, rgba(24, 24, 27, 0.8), ${gradient.to})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center gap-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={playlist.imageUrl || "/default-playlist.jpeg"}
              alt={playlist.title}
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
            />
            <div className="flex flex-col justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Badge
                  variant="outline"
                  className="mb-2 text-xs uppercase border-zinc-600 text-zinc-300"
                >
                  Playlist
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md font-outfit">
                  {playlist.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-300">
                  <span>
                    Created by: {playlist.user.name || "Unknown User"}
                  </span>
                  <span>•</span>
                  <span>{playlist.tracks?.length || playlist.total_tracks || 0} songs</span>
                  <span>•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                <p className="mt-2 text-zinc-400 max-w-2xl">
                  {playlist.description ||
                    "A curated selection of tracks for you to enjoy."}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex gap-4"
              >
                <Button
                  size="lg"
                  className="rounded-full bg-green-500 hover:bg-green-400 text-black shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={handlePlayPlaylist}
                >
                  {isPlaying &&
                  playlist.tracks?.some(
                    (song) => song._id === currentSong?._id
                  ) ? (
                    <Pause className="h-5 w-5 mr-2 fill-black" />
                  ) : (
                    <Play className="h-5 w-5 mr-2 fill-black" />
                  )}
                  {isPlaying &&
                  playlist.tracks?.some((song) => song._id === currentSong?._id)
                    ? "Pause"
                    : "Play"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleToggleLike}
                  className={`rounded-full border-zinc-600 hover:bg-zinc-700 transition-all duration-200 ${
                    isLiked ? "text-rose-500 border-rose-500" : "text-zinc-300"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-rose-500" : ""}`}
                  />
                </Button>
                {/* <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-zinc-600 hover:bg-zinc-700 transition-all duration-200"
                >
                  <Share2 className="h-5 w-5" />
                </Button> */}
                <ShareSongDialog songId={playlist._id} songTitle={playlist.title} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-12 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800/50 overflow-hidden"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit px-6 pt-6">
              Tracks
            </h2>
            <ScrollArea className="h-full">
              <Table className="w-full overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-zinc-800/50 border-b border-zinc-700/50 hover:bg-zinc-800 transition-colors duration-200">
                    {/* <TableHead className="w-[40px]"></TableHead> */}
                    <TableHead className="w-[40px] text-zinc-300 text-right">
                      #
                    </TableHead>
                    <TableHead className="w-[60px] text-zinc-300">
                      Image
                    </TableHead>
                    <TableHead className="text-zinc-300">Title</TableHead>
                    <TableHead className="hidden md:table-cell text-zinc-300">
                      Genres
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-zinc-300">
                      Streams
                    </TableHead>
                    <TableHead className="text-right text-zinc-300">
                      <Clock className="h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="text-right text-zinc-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="wait">
                    {(playlist.tracks || []).length === 0 ? (
                      <motion.tr
                        key="no-songs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell
                          colSpan={8}
                          className="text-center py-10 text-zinc-400"
                        >
                          No songs in this playlist. Add some to get started!
                        </TableCell>
                      </motion.tr>
                    ) : (
                      (playlist.tracks || []).map((song, index) => {
                        const isCurrentSong = currentSong?._id === song._id;
                        const progress =
                          isCurrentSong && song.duration > 0
                            ? (playbackPosition / song.duration) * 100
                            : 0;

                        return (
                          <>
                            <motion.tr
                              key={song._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              className={`border-b border-zinc-800/50 ${
                                isCurrentSong
                                  ? "bg-gradient-to-r from-emerald-900/20 to-zinc-800/50"
                                  : "hover:bg-zinc-800/70"
                              } transition-colors duration-200`}
                              onClick={() => handlePlaySong(index)}
                            >
                              {/* <TableCell className="w-[40px]">
                                <GripVertical className="h-4 w-4 text-zinc-500 hover:text-zinc-300 transition-colors duration-200 cursor-grab" />
                              </TableCell> */}
                              <TableCell className="w-[40px] text-zinc-400 text-right">
                                {isCurrentSong && isPlaying ? (
                                  <motion.img
                                    src="/playing.gif"
                                    alt="Playing"
                                    className="w-4 h-4 object-contain"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      duration: 0.3,
                                      repeat: Infinity,
                                      repeatType: "reverse",
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-6 h-6 relative">
                                    <motion.span
                                      className="text-zinc-400 text-sm absolute"
                                      whileHover={{ opacity: 0 }}
                                    >
                                      {index + 1}
                                    </motion.span>
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      whileHover={{ opacity: 1 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Play className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                                    </motion.div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="w-[60px]">
                                <div className="relative group">
                                  <img
                                    src={song.imageUrl || "/default-song.jpg"}
                                    alt={song.title}
                                    className="w-12 h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span
                                    className={`text-sm font-medium truncate max-w-[200px] ${
                                      isCurrentSong
                                        ? "text-emerald-400 font-semibold"
                                        : "text-white"
                                    }`}
                                  >
                                    <Link
                                      to={`/songs/${song._id}`}
                                      className="hover:text-emerald-400 transition-colors duration-200"
                                    >
                                      {song.title}
                                    </Link>
                                  </span>
                                  <span className="text-xs text-zinc-400 truncate max-w-[200px]">
                                    {song.artists
                                      ?.map((a) => a.name)
                                      .join(", ") || "Unknown Artist"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-xs text-zinc-400 truncate max-w-[300px]">
                                {(song.genres || []).map((genre) => (
                                  <Badge
                                    key={genre._id}
                                    variant="secondary"
                                    className="bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors mr-1"
                                  >
                                    <Link
                                      key={genre._id}
                                      to={`/genres/${genre._id}`}
                                      className="hover:text-sky-400 transition-colors "
                                    >
                                      #{genre.name}
                                    </Link>
                                  </Badge>
                                ))}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-zinc-400">
                                {song.streams?.toLocaleString("en-US") || 0}
                              </TableCell>
                              <TableCell className="text-right text-zinc-400 text-sm">
                                {formatDuration(song.duration || 0)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end items-center">
                                  {!playlistId.startsWith("daily-mix") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTrack(song._id);
                                      }}
                                      className="text-zinc-400 hover:text-red-500 hover:bg-red-900/20 rounded-full p-1 transition-colors duration-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                            {isCurrentSong && isPlaying && (
                              <motion.tr
                                key={`${song._id}-progress`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <TableCell colSpan={8} className="p-0">
                                  <Progress
                                    value={progress}
                                    className="bg-zinc-800 h-1 rounded-none [&>div]:bg-emerald-500"
                                  />
                                </TableCell>
                              </motion.tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-zinc-800/30 rounded-lg p-6 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
                Playlist Description
              </h2>
              <ScrollArea className="h-40 text-zinc-300">
                <p className="leading-relaxed">
                  {playlist.description ||
                    "This is a custom playlist created by the user. Enjoy the curated selection of tracks!"}
                </p>
              </ScrollArea>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="bg-zinc-800/30 rounded-lg p-6 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
                About the Creator
              </h2>
              <div className="flex items-center gap-4">
                <img
                  src={playlist.user?.imageUrl || "/default-user.jpg"}
                  alt="Creator"
                  className="w-16 h-16 rounded-full object-cover shadow-md transition-transform duration-300 hover:scale-105"
                />
                <div>
                  <p className="font-medium text-white">
                    {playlist.user?.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    A music enthusiast who crafted this playlist.
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistPage;
