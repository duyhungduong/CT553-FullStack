import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatDuration } from "@/utils/formatDuration";
import { Clock, Heart, Pause, Play, Send, Star } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import AddToPlaylistDialog from "./components/AddToPlaylistDialog";
import { AnimatePresence, motion } from "framer-motion";
import { extractColors } from "extract-colors";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import toast from "react-hot-toast";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Playlist, Song } from "@/types";
import { Toggle } from "@/components/ui/toggle";
import { DropdownMenuDemo } from "../home/components/DropdownMenu";
import AddSongToPlaylistDialog from "./components/AddSongToPlaylistDialog";
import ShareSongDialog from "./components/ShareSongDialog";
import AddToFavorite from "../queue/components/AddToFavorite";

const SongPage = () => {
  const { songId } = useParams();
  const {
    fetchSongById,
    currentSong,
    getRelatedSongs,
    relatedSongs,
    fetchReviewsBySong,
    reviews,
    addReview,
  } = useMusicStore();
  const {
    currentSong: playingSong,
    isPlaying,
    setCurrentSong,
    togglePlay,
    playbackPosition,
  } = usePlayerStore();

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
  useEffect(() => {
    if (info?._id) {
      fetchUserFavorites(info._id, 1, 1000);
      fetchPlaylists(1, 100);
    }
  }, [info?._id, fetchUserFavorites, fetchPlaylists]);

  const { addToQueue } = usePlayerStore();

  const isFavorite = (songId: string) =>
    favorites.some((fav) => fav._id === songId);
  const [favoriteStatus, setFavoriteStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const isSongInPlaylist = (playlist: Playlist, songId: string): boolean =>
    playlist.tracks?.some((track) => track._id === songId) || false;

  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const handleAddToQueue = async (song: Song) => {
    const userId = info?._id;
    if (!userId) {
      toast.error("Please log in to add songs to queue");
      return;
    }
    await addToQueue(song, userId);
    toast.success(`${song.title} added to queue`);
  };

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
        setIsLiked(false);
      } else {
        await addSongToFavorites(info._id, songId);
        // toast.success("Added to favorites");
        setIsLiked(true);
      }
      await fetchUserFavorites(info._id, 1, 1000);
    } catch (error) {
      setFavoriteStatus((prev) => ({ ...prev, [songId]: isFavorited }));
      toast.error(`Failed to update favorite status: ${error}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [songId]: false }));
    }
  };

  const [isLiked, setIsLiked] = useState(false);
  const [gradient, setGradient] = useState<{ from: string; to: string }>({
    from: "#3B82F6",
    to: "#0D1C38",
  });
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const { fetchInfo } = useChatStore();

  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchInfo(); // Gọi fetchInfo để lấy thông tin user
  }, [fetchInfo]);

  useEffect(() => {
    if (songId) {
      fetchSongById(songId);
      getRelatedSongs(songId, 6);
      fetchReviewsBySong(songId);
    }
  }, [fetchSongById, songId, getRelatedSongs, fetchReviewsBySong]);

  useEffect(() => {
    if (info?._id) {
      setUserId(info._id);
    }
  }, [info]);

  useEffect(() => {
    if (currentSong?.imageUrl) {
      extractColors(currentSong.imageUrl)
        .then((colors) => {
          if (colors.length >= 2) {
            setGradient({ from: colors[0].hex, to: colors[1].hex });
          } else if (colors.length === 1) {
            setGradient({ from: colors[0].hex, to: "#0D1C38" });
          }
        })
        .catch((error) => {
          console.error("Error extracting colors:", error);
        });
    }
  }, [currentSong]);

  const handlePlaySong = () => {
    if (!currentSong) return;
    if (playingSong?._id === currentSong._id) {
      togglePlay(info?.clerkId || "");
    } else {
      setCurrentSong(currentSong, info?.clerkId || "");
    }
  };

  const handleRatingClick = (rating: number) => {
    setNewRating(rating);
  };

  const handleAddReview = async () => {
    if (!newRating || !userId || !songId) {
      if (!userId) toast.error("Please login before reviewing!");
      if (!songId) toast.error("Song ID is missing!");
      if (!newRating) toast.error("Please provide a rating!");
      return;
    }

    await addReview({
      user_id: userId, 
      song_id: songId, 
      rating: newRating,
      comment: newComment.trim() || undefined,
    });
    setNewComment("");
    setNewRating(0);
  };

  if ( !currentSong) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-900">
        Loading...
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
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={"/songs"}>Songs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={`/songs/${currentSong._id}`}>
                  {currentSong.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ScrollArea className="h-[calc(100vh-120px)]">
        {/* Song Header Section */}
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
              src={currentSong.imageUrl || "/default-song.jpg"}
              alt={currentSong.title}
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
                  Single
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md font-outfit">
                  {currentSong.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-300">
                  <Link
                    to={`/artists/${currentSong.artists[0]._id}`}
                    className="hover:text-sky-400 text-white font-medium transition-colors"
                  >
                    {currentSong.artists[0].name}
                  </Link>
                  <span>•</span>
                  <span>{currentSong.releaseYear}</span>
                  <span>•</span>
                  <span>{formatDuration(currentSong.duration)}</span>
                  <Link
                    to={`/albums/${currentSong.album?._id}`}
                    className="hover:text-sky-400 text-white font-medium transition-colors"
                  >
                    {currentSong.album?.title}
                  </Link>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {currentSong.genres.map((genre) => (
                    <Badge
                      key={genre._id}
                      variant="secondary"
                      className="bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
                    >
                      <Link to={`/genres/${genre._id}`}>#{genre.name}</Link>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {currentSong.instruments.map((instrument) => (
                    <Badge
                      key={instrument._id}
                      variant="secondary"
                      className="bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
                    >
                      <Link to={`/instruments/${instrument._id}`}>
                        #{instrument.name}
                      </Link>
                    </Badge>
                  ))}
                </div>
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
                  onClick={handlePlaySong}
                >
                  {isPlaying && playingSong?._id === currentSong._id ? (
                    <Pause className="h-5 w-5 mr-2 fill-black" />
                  ) : (
                    <Play className="h-5 w-5 mr-2 fill-black" />
                  )}
                  {isPlaying && playingSong?._id === currentSong._id
                    ? "Pause"
                    : "Play"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  // onClick={handleToggleLike}
                  className={`rounded-full p-3 border-zinc-600 hover:bg-zinc-700 transition-all duration-200 ${
                    isLiked ? "text-rose-500 border-rose-500" : "text-zinc-300"
                  }`}
                >
                  {/* <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-rose-500" : ""}`}
                  /> */}
                  <AddToFavorite songId={currentSong._id} />
                </Button>
                <AddSongToPlaylistDialog songId={currentSong._id} />
                <ShareSongDialog songId={currentSong._id} songTitle={currentSong.title} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Song Info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-12 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800/50 overflow-hidden"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit px-6 pt-6">
              Song Details
            </h2>
            <ScrollArea className="h-full">
              <Table className="w-full overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-zinc-800/50 border-b border-zinc-700/50 hover:bg-zinc-800 transition-colors duration-200">
                    <TableHead className="w-[40px] text-zinc-300 text-right">
                      #
                    </TableHead>
                    <TableHead className="w-[60px] text-zinc-300">
                      Image
                    </TableHead>
                    <TableHead className="text-zinc-300">Title</TableHead>
                    <TableHead className="text-zinc-300">Album</TableHead>
                    <TableHead className="hidden md:table-cell text-zinc-300">
                      Genre
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-zinc-300">
                      Instrument
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
                    <motion.tr
                      key={currentSong._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`border-b border-zinc-800/50 ${
                        playingSong?._id === currentSong._id
                          ? "bg-gradient-to-r from-emerald-900/20 to-zinc-800/50"
                          : "hover:bg-zinc-800/70"
                      } transition-colors duration-200`}
                      onClick={handlePlaySong}
                    >
                      <TableCell className="w-[40px] text-zinc-400 text-right">
                        {playingSong?._id === currentSong._id && isPlaying ? (
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
                              1
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
                            src={currentSong.imageUrl || "/default-song.jpg"}
                            alt={currentSong.title}
                            className="w-12 h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`text-sm font-medium truncate max-w-[200px] ${
                              playingSong?._id === currentSong._id
                                ? "text-emerald-400 font-semibold"
                                : "text-white"
                            }`}
                          >
                            <Link
                              to={`/songs/${currentSong._id}`}
                              className="hover:text-emerald-400 transition-colors duration-200"
                            >
                              {currentSong.title}
                            </Link>
                          </span>
                          <span className="text-xs text-zinc-400 truncate max-w-[200px]">
                            {currentSong.artists[0].name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {currentSong.album?.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-zinc-400">
                        {currentSong.genres.map((genre) => (
                          <Badge
                            key={genre._id}
                            variant="secondary"
                            className="bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors mr-1"
                          >
                            <Link to={`/genres/${genre._id}`}>
                              #{genre.name}
                            </Link>
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-zinc-400">
                        {currentSong.instruments.map((instrument) => (
                          <Badge
                            key={instrument._id}
                            variant="secondary"
                            className="bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors mr-1"
                          >
                            <Link to={`/instruments/${instrument._id}`}>
                              #{instrument.name}
                            </Link>
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-zinc-400">
                        {currentSong.streams.toLocaleString("en-US")}
                      </TableCell>
                      <TableCell className="text-right text-zinc-400 text-sm">
                        {formatDuration(currentSong.duration)}
                      </TableCell>
                    </motion.tr>
                    {playingSong?._id === currentSong._id && isPlaying && (
                      <motion.tr
                        key={`${currentSong._id}-progress`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell colSpan={5} className="p-0">
                          <Progress
                            value={
                              (playbackPosition / currentSong.duration) * 100
                            }
                            className="bg-zinc-800 h-1 rounded-none [&>div]:bg-emerald-500"
                          />
                        </TableCell>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          </motion.section>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Song Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/50"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
                Reviews
              </h2>
              {/* Form để thêm review */}
              <div className="mb-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                <div className="flex items-center justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Star
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          star <= newRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-zinc-400 hover:text-yellow-300 hover:fill-yellow-300"
                        }`}
                        onClick={() => handleRatingClick(star)}
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your review..."
                    className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 rounded-lg focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                  />
                  <Button
                    onClick={handleAddReview}
                    disabled={!newRating}
                    className="bg-sky-500 hover:bg-sky-400 text-white rounded-full p-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              {/* Hiển thị review */}
              <ScrollArea className="h-48 text-zinc-300">
                {reviews.length > 0 ? (
                  <>
                    {reviews.slice(0, 2).map((review) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4 bg-zinc-800/30 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              typeof review.user_id === "string"
                                ? "/default-user.jpg"
                                : review.user_id.imageUrl
                            }
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover shadow-md"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {typeof review.user_id === "string"
                                ? "Unknown User"
                                : review.user_id.fullName}
                            </p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-zinc-400"
                                  }`}
                                />
                              ))}
                            </div>
                            {review.comment && (
                              <p className="mt-1 text-sm text-zinc-300 line-clamp-2">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {reviews.length > 2 && (
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={setIsExpanded}
                        className="mt-2"
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="link"
                            className="text-sky-400 p-0 hover:text-sky-300 transition-colors duration-200"
                          >
                            {isExpanded ? "Show Less" : "Show More Reviews"}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {reviews.slice(2).map((review) => (
                            <motion.div
                              key={review._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 bg-zinc-800/30 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    typeof review.user_id === "string"
                                      ? "/default-user.jpg"
                                      : review.user_id.imageUrl
                                  }
                                  alt="User"
                                  className="w-10 h-10 rounded-full object-cover shadow-md"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white truncate">
                                    {typeof review.user_id === "string"
                                      ? "Unknown User"
                                      : review.user_id.fullName}
                                  </p>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-zinc-400"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {review.comment && (
                                    <p className="mt-1 text-sm text-zinc-300 line-clamp-2">
                                      {review.comment}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </>
                ) : (
                  <p className="text-zinc-400 text-center py-4">
                    No reviews yet. Be the first to review this song!
                  </p>
                )}
              </ScrollArea>
            </motion.section>

            {/* Artist Info */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/50"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
                About the Artist
              </h2>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/70 transition-colors duration-200"
              >
                <img
                  src={currentSong.artists[0].imageUrl || "/default-artist.jpg"}
                  alt={currentSong.artists[0].name}
                  className="w-16 h-16 rounded-full object-cover shadow-md transition-transform duration-300 hover:scale-110"
                />
                <div className="flex-1">
                  <p className="font-medium text-white truncate">
                    {currentSong.artists[0].name}
                  </p>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    A talented artist known for their unique sound and
                    captivating performances.
                  </p>
                  <Link
                    to={`/artists/${currentSong.artists[0]._id}`}
                    className="text-sky-400 hover:text-sky-300 text-sm block mt-2 transition-colors duration-200"
                  >
                    View Artist Profile
                  </Link>
                </div>
              </motion.div>
            </motion.section>
          </div>
          {/* Related Songs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
              Related Songs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {relatedSongs?.length > 0 ? (
                relatedSongs.map((song, index) => (
                  <motion.div
                    key={song._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                          <CardContent className="p-4 relative">
                            <div className="relative mb-3">
                              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={song.imageUrl}
                                  alt={song.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
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
                            <div className="truncate text-center">
                              <Link
                                to={`/songs/${song._id}`}
                                className="font-medium text-sm text-white hover:text-sky-400 truncate block transition-colors"
                              >
                                {song.title}
                              </Link>
                              <p className="text-xs text-zinc-400 truncate">
                                {song.artists.map((a) => a.name).join(", ")}
                              </p>
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
                                        handleAddToPlaylist(
                                          playlist._id,
                                          song._id
                                        )
                                      }
                                      disabled={localLoading[song._id]}
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
                ))
              ) : (
                <p className="text-zinc-400 col-span-full">
                  No related songs found.
                </p>
              )}
            </div>
          </motion.section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SongPage;
