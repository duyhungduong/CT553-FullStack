// app/routes/daily-mix.$mixId.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatDuration } from "@/utils/formatDuration";
import { Clock, Heart, Pause, Play } from "lucide-react";
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
import PlayButton from "@/pages/playlist/components/PlayButton";
import ShareSongDialog from "../song/components/ShareSongDialog";

const rowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, height: 0, transition: { duration: 0.3 } },
};

export default function DailyMixPage() {
  const { mixId } = useParams();
  const { currentSong, isPlaying, togglePlay, playbackPosition, playPlaylist } =
    usePlayerStore();
  const [dailyMix, setDailyMix] = useState<Playlist | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [gradient, setGradient] = useState<{ from: string; to: string }>({
    from: "#F59E0B",
    to: "#1E293B",
  });
  const { userId } = useAuth();

  useEffect(() => {
    const storedMixes = JSON.parse(localStorage.getItem("dailyMixes") || "[]");
    const mix = storedMixes.find((m: Playlist) => m._id === mixId);
    if (mix) {
      setDailyMix(mix);
    }
  }, [mixId]);

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
    if (dailyMix?.imageUrl && dailyMix.imageUrl.startsWith("http")) {
      extractGradient(dailyMix.imageUrl);
    }
  }, [dailyMix?.imageUrl, extractGradient]);

  const handlePlayPlaylist = () => {
    if (!dailyMix?.tracks?.length) return;
    const isCurrentPlaylistPlaying = dailyMix.tracks.some(
      (song) => song._id === currentSong?._id
    );
    if (isCurrentPlaylistPlaying) togglePlay(userId || "");
    else playPlaylist(dailyMix.tracks, userId || "", 0, dailyMix._id);
  };

  const handlePlaySong = (index: number) => {
    if (!dailyMix?.tracks?.length) return;
    if (currentSong?._id === dailyMix.tracks[index]._id) {
      togglePlay(userId || "");
    } else {
      playPlaylist(dailyMix.tracks, userId || "", index, dailyMix._id);
    }
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const totalDuration = (dailyMix?.tracks || []).reduce(
    (sum, track) => sum + (track.duration || 0),
    0
  );

  if (!dailyMix || !mixId) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-900">
        Daily Mix not found
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-zinc-900 to-black text-white">
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
                {dailyMix.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <section
          className="relative"
          style={{
            background: `linear-gradient(to bottom right, ${gradient.from}, rgba(24, 24, 27, 0.8), ${gradient.to})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center gap-8">
            {!dailyMix ? (
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg bg-zinc-800 animate-pulse" />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105"
                style={
                  dailyMix.imageUrl?.startsWith("linear-gradient")
                    ? {
                        background: dailyMix.imageUrl,
                        backgroundSize: "150%",
                        transition: "background-position 0.3s",
                      }
                    : {}
                }
              >
                {!dailyMix.imageUrl?.startsWith("linear-gradient") && (
                  <img
                    src={dailyMix.imageUrl || "/default-mix.jpg"}
                    alt={dailyMix.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </motion.div>
            )}
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
                  Daily Mix
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md font-outfit">
                  {dailyMix.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-300">
                  <span>Created by: {dailyMix.user?.name || "Daily Mix"}</span>
                  <span>•</span>
                  <span>{dailyMix.total_tracks || 0} songs</span>
                  <span>•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                <p className="mt-2 text-zinc-400 max-w-2xl">
                  {dailyMix.description}
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
                  dailyMix.tracks?.some(
                    (song) => song._id === currentSong?._id
                  ) ? (
                    <Pause className="h-5 w-5 mr-2 fill-black" />
                  ) : (
                    <Play className="h-5 w-5 mr-2 fill-black" />
                  )}
                  {isPlaying &&
                  dailyMix.tracks?.some((song) => song._id === currentSong?._id)
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
                <ShareSongDialog songId={dailyMix._id} songTitle={dailyMix.title} />
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-12 bg-zinc-800/30 rounded-lg p-6 shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
              Tracks
            </h2>
            <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800/50 overflow-hidden">
              <ScrollArea className="h-full">
                <Table className="w-full overflow-hidden">
                  <TableHeader>
                    <TableRow className="bg-zinc-800/50 border-b border-zinc-700/50 hover:bg-zinc-800 transition-colors duration-200">
                      <TableHead className="w-[40px] text-zinc-300">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="wait">
                      {(dailyMix.tracks || []).map((song, index) => {
                        const isCurrentSong = currentSong?._id === song._id;
                        const progress =
                          isCurrentSong && song.duration > 0
                            ? (playbackPosition / song.duration) * 100
                            : 0;

                        return (
                          <>
                            <motion.tr
                              key={song._id}
                              variants={rowVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              layout
                              onClick={() => handlePlaySong(index)}
                              className={`border-b border-zinc-800/50 ${
                                isCurrentSong
                                  ? "bg-gradient-to-r from-emerald-900/20 to-zinc-800/50"
                                  : "hover:bg-zinc-800/70"
                              } transition-colors duration-200 cursor-pointer`}
                            >
                              <TableCell className="w-[40px] text-zinc-400">
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
                                  <PlayButton
                                    song={song}
                                    songs={dailyMix.tracks || []}
                                    className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-full p-2"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <Link
                                    to={`/songs/${song._id}`}
                                    className={`text-sm font-medium truncate max-w-[200px] ${
                                      isCurrentSong
                                        ? "text-emerald-400 font-semibold"
                                        : "text-white"
                                    } hover:text-emerald-400 transition-colors`}
                                  >
                                    {song.title}
                                  </Link>
                                  <p className="text-xs text-zinc-400 truncate max-w-[200px]">
                                    {song.artists
                                      ?.map((a) => a.name)
                                      .join(", ") || "Unknown Artist"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell truncate max-w-[150px]">
                                {(song.genres || []).map((genre) => (
                                  <Badge
                                    key={genre._id}
                                    variant="secondary"
                                    className="bg-zinc-700 text-zinc-200 text-xs hover:bg-emerald-700/50 mr-1 transition-colors"
                                  >
                                    <Link to={`/genres/${genre._id}`}>
                                      #{genre.name}
                                    </Link>
                                  </Badge>
                                ))}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-zinc-400">
                                {song.streams?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell className="text-right text-zinc-400 text-sm">
                                {formatDuration(song.duration || 0)}
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
                                <TableCell colSpan={6} className="p-0">
                                  <Progress
                                    value={progress}
                                    className="bg-zinc-800 h-1 rounded-none [&>div]:bg-emerald-500"
                                  />
                                </TableCell>
                              </motion.tr>
                            )}
                          </>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </motion.section>
        </div>
      </ScrollArea>
    </div>
  );
}
