import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatDuration } from "@/utils/formatDuration";
import { Clock, Heart, Pause, Play } from "lucide-react";
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
import { extractColors } from "extract-colors";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import ShareSongDialog from "../song/components/ShareSongDialog";
// import { DropdownMenuDemo } from "../home/components/DropdownMenu";
// const gradientColors = [
//   { from: "#8B5CF6", to: "#1F2937" },
//   { from: "#EC4899", to: "#111827" },
//   { from: "#10B981", to: "#0F172A" },
//   { from: "#F59E0B", to: "#1E293B" },
//   { from: "#3B82F6", to: "#0D1C38" },
//   { from: "#EF4444", to: "#1C2526" },
//   { from: "#6D28D9", to: "#111827" },
//   { from: "#14B8A6", to: "#0F172A" },
//   { from: "#D97706", to: "#1F2937" },
//   { from: "#8B5CF6", to: "#0D1C38" },
// ];

const AlbumPage = () => {
  const { albumId } = useParams();
  const {
    fetchAlbumById,
    currentAlbum,
    isLoading,
    getRelatedAlbums,
    relatedAlbums,
  } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay, playbackPosition } =
    usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);
  const [gradient, setGradient] = useState<{ from: string; to: string }>({
    from: "#F59E0B",
    to: "#1E293B",
  });
  const { userId } = useAuth();

  useEffect(() => {
    if (albumId) {
      fetchAlbumById(albumId);
      getRelatedAlbums(albumId, 6);
    }
  }, [fetchAlbumById, albumId, getRelatedAlbums]);

  useEffect(() => {
    if (currentAlbum?.imageUrl) {
      extractColors(currentAlbum.imageUrl)
        .then((colors) => {
          if (colors.length >= 2) {
            setGradient({ from: colors[0].hex, to: colors[1].hex });
          } else if (colors.length === 1) {
            setGradient({ from: colors[0].hex, to: "#111827" });
          }
        })
        .catch((error) => {
          console.error("Error extracting colors:", error);
        });
    }
  }, [currentAlbum]);

  const handlePlayAlbum = () => {
    if (!currentAlbum?.tracks) return;
    const isCurrentAlbumPlaying = currentAlbum.tracks.some(
      (song) => song._id === currentSong?._id
    );
    if (isCurrentAlbumPlaying) togglePlay(userId || "");
    else playAlbum(currentAlbum.tracks, userId || "", 0);
  };

  const handlePlaySong = (index: number) => {
    if (!currentAlbum?.tracks) return;
    if (currentSong?._id === currentAlbum.tracks[index]._id) {
      togglePlay(userId || "");
    } else {
      playAlbum(currentAlbum.tracks, userId || "", index);
    }
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
    // Optionally integrate with backend
  };

  if (!currentAlbum && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-900">
        Album not found
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
                <Link to={"/albums"}>Albums</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={`/albums/${currentAlbum?._id}`}>
                  {currentAlbum?.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ScrollArea className="h-[calc(100vh-120px)]">
        {/* Album Header Section */}
        <section
          className="relative"
          style={{
            background: `linear-gradient(135deg, ${gradient.from} 0%, rgba(24, 24, 27, 0.8) 50%, ${gradient.to} 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center gap-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={currentAlbum?.imageUrl || "/default-album.jpg"}
              alt={currentAlbum?.title}
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
                  Album
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md font-outfit">
                  {currentAlbum?.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-300">
                  <Link
                    to={`/artists/${currentAlbum?.artist._id}`}
                    className="hover:text-sky-400 text-white font-medium transition-colors"
                  >
                    {currentAlbum?.artist.name}
                  </Link>
                  <span>•</span>
                  <span>{currentAlbum?.tracks?.length || 0} songs</span>
                  <span>•</span>
                  <span>{currentAlbum?.releaseYear}</span>
                  <span>•</span>
                  {currentAlbum && (
                    <span>{formatDuration(currentAlbum?.total_duration)}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {currentAlbum?.genres?.map((genre) => (
                    <Badge
                      key={genre._id}
                      variant="secondary"
                      className="bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
                    >
                      #{genre.name}
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
                  onClick={handlePlayAlbum}
                >
                  {isPlaying &&
                  currentAlbum?.tracks?.some(
                    (song) => song._id === currentSong?._id
                  ) ? (
                    <Pause className="h-5 w-5 mr-2 fill-black" />
                  ) : (
                    <Play className="h-5 w-5 mr-2 fill-black" />
                  )}
                  {isPlaying &&
                  currentAlbum?.tracks?.some(
                    (song) => song._id === currentSong?._id
                  )
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
                <ShareSongDialog songId={currentAlbum?._id || ""} songTitle={currentAlbum?.title || ""}/>
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
            {isLoading ? (
              <div className="text-center text-zinc-400 py-4">
                Loading tracks...
              </div>
            ) : (
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
                      {currentAlbum?.tracks?.length === 0 ? (
                        <motion.tr
                          key="no-songs"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell
                            colSpan={6}
                            className="text-center py-10 text-zinc-400"
                          >
                            No songs in this album.
                          </TableCell>
                        </motion.tr>
                      ) : (
                        currentAlbum?.tracks?.map((song, index) => {
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
                                  {song.genres?.map((genre) => (
                                    <Badge
                                      key={genre._id}
                                      variant="secondary"
                                      className="bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors mr-1"
                                    >
                                      <Link
                                        to={`/genres/${genre._id}`}
                                        className="hover:text-sky-400 transition-colors"
                                      >
                                        #{genre.name}
                                      </Link>
                                    </Badge>
                                  ))}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-zinc-400">
                                  {song.streams.toLocaleString("en-US")}
                                </TableCell>
                                <TableCell className="text-right text-zinc-400 text-sm">
                                  {formatDuration(song.duration)}
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
                        })
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </motion.section>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Album Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-zinc-800/30 rounded-lg p-6 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
                Album Description
              </h2>
              <ScrollArea className="h-40 text-zinc-300">
                <p className="leading-relaxed">
                  {currentAlbum?.description ||
                    "This is a placeholder description for the album. Add a real one via your backend!"}
                </p>
              </ScrollArea>
            </motion.section>

            {/* Artist Info */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="bg-zinc-800/30 rounded-lg p-6 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
                About the Artist
              </h2>
              <div className="flex items-center gap-4">
                <img
                  src={currentAlbum?.artist.imageUrl || "/default-artist.jpg"}
                  alt={currentAlbum?.artist.name}
                  className="w-16 h-16 rounded-full object-cover shadow-md transition-transform duration-300 hover:scale-105"
                />
                <div>
                  <p className="font-medium text-white">
                    {currentAlbum?.artist.name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    A talented artist known for their unique sound.
                  </p>
                  <Link
                    to={`/artists/${currentAlbum?.artist._id}`}
                    className="text-sky-400 hover:underline text-sm block mt-1"
                  >
                    View Artist
                  </Link>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Related Albums */}
          {/* Related Albums */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
              Related Albums
            </h2>
            {isLoading ? (
              <div className="text-center text-zinc-400">
                Loading related albums...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {relatedAlbums?.length > 0 ? (
                  relatedAlbums.map((album, index) => (
                    <motion.div
                      key={album._id}
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
                                    src={album.imageUrl || "/default-album.jpg"}
                                    alt={album.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                {/* <DropdownMenuDemo album={album} /> */}
                              </div>
                              <div className="truncate text-center">
                                <Link
                                  to={`/albums/${album._id}`}
                                  className="font-medium text-sm text-white hover:text-sky-400 truncate block transition-colors"
                                >
                                  {album.title}
                                </Link>
                                <p className="text-xs text-zinc-400 truncate">
                                  {album.artist?.name || "Unknown Artist"}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-64 bg-zinc-800 border-zinc-700 text-white">
                          <ContextMenuItem className="hover:bg-zinc-700">
                            <Link to={`/albums/${album._id}`}>
                              View Details
                            </Link>
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="hover:bg-zinc-700"
                            // onClick={() => handleAddToQueue(album)}
                          >
                            Add to Queue
                          </ContextMenuItem>
                          <ContextMenuSub>
                            <ContextMenuSubTrigger className="hover:bg-zinc-700">
                              Add to Playlist
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 bg-zinc-800 border-zinc-700 text-white">
                              <ScrollArea className="max-h-60">
                                {/* {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                          <ContextMenuItem
                            key={playlist._id}
                            onClick={() =>
                              handleAddToPlaylist(playlist._id, album._id)
                            }
                            disabled={localLoading[album._id]}
                            className="hover:bg-zinc-700"
                          >
                            {playlist.title}
                          </ContextMenuItem>
                        ))
                      ) : (
                        <ContextMenuItem disabled>
                          No playlists available
                        </ContextMenuItem>
                      )} */}
                              </ScrollArea>
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                        </ContextMenuContent>
                      </ContextMenu>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-zinc-400 col-span-full">
                    No related albums found.
                  </p>
                )}
              </div>
            )}
          </motion.section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;
