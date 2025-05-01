import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatDuration } from "@/utils/formatDuration";
import { BadgeCheck, Clock, Heart, Play, Share2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/clerk-react";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const ArtistPage = () => {
  const { artistId } = useParams();
  const {
    fetchArtistById,
    currentArtist,
    isLoading,
    songsByArtists,
    fetchSongByArtist,
  } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay, playbackPosition } =
    usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);
  const { userId } = useAuth();
  useEffect(() => {
    if (artistId) {
      fetchArtistById(artistId);
      fetchSongByArtist(artistId, 1, 20);
    }
  }, [fetchArtistById, artistId, fetchSongByArtist]);

  const handlePlaySong = (index: number) => {
    if (!songsByArtists) return;
    if (currentSong?._id === songsByArtists[index]._id) {
      togglePlay(userId || "");
    } else {
      playAlbum(songsByArtists, userId || "", index);
    }
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
    // Optionally integrate with a backend to save liked state
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-900">
        Loading...
      </div>
    );
  }

  if (!currentArtist) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-900">
        Artist not found
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
                <Link to={"/artists"}>Artists</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={`/artists/${currentArtist._id}`}>
                  {currentArtist.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ScrollArea className="h-[calc(100vh-120px)]">
        {/* Artist Header Section */}
        <section className="relative bg-gradient-to-br from-sky-900/50 via-zinc-900 to-black">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center gap-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={currentArtist.imageUrl || "/default-artist.jpg"}
              alt={currentArtist.name}
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-full object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
            />
            <div className="flex flex-col justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-6 h-6 text-sky-500" />
                  <Badge
                    variant="outline"
                    className="text-xs uppercase border-zinc-600 text-zinc-300"
                  >
                    Artist
                  </Badge>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md font-outfit">
                  {currentArtist.name}
                </h1>
                <p className="mt-2 text-sm text-zinc-300">
                  Joined:{" "}
                  {new Date(currentArtist.joined_date).toLocaleDateString()} •{" "}
                  {currentArtist.is_verified && "Verified Artist"}
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
                  onClick={() => handlePlaySong(0)}
                >
                  <Play className="h-5 w-5 mr-2" /> Play
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
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-zinc-600 hover:bg-zinc-700 transition-all duration-200"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Artist Bio */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-12 bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/50"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
              About {currentArtist.name}
            </h2>
            <Collapsible>
              <p className="leading-relaxed text-zinc-300">
                {currentArtist.bio || (
                  <>
                    This artist has no bio yet. Check out their
                    <Link
                      to="/songs"
                      className="text-sky-400 hover:underline"
                    >
                      top songs
                    </Link>{" "}
                    below!
                  </>
                )}
              </p>
              {currentArtist.bio?.length > 150 && (
                <>
                  <CollapsibleTrigger asChild>
                    <Button variant="link" className="text-sky-400 p-0 mt-2">
                      Read More
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <p className="leading-relaxed text-zinc-300 mt-2">
                      {currentArtist.bio}
                    </p>
                  </CollapsibleContent>
                </>
              )}
            </Collapsible>
          </motion.section>

          {/* Top Songs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-12 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800/50 overflow-hidden"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit px-6 pt-6">
              Top Songs
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
                    {(songsByArtists || []).length === 0 ? (
                      <motion.tr
                        key="no-songs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell
                          colSpan={5}
                          className="text-center py-10 text-zinc-400"
                        >
                          No songs available for this artist.
                        </TableCell>
                      </motion.tr>
                    ) : (
                      (songsByArtists || []).slice(0, 5).map((song, index) => {
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
                                    {currentArtist.name}
                                  </span>
                                </div>
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
                                <TableCell colSpan={5} className="p-0">
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

          {/* Albums */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
              Albums
            </h2>
            {/* Uncomment and adjust if albums data is available */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {(currentArtist.albums || []).slice(0, 5).map((album) => (
                <motion.div
                  key={album._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="relative mb-3">
                        <img
                          src={album.imageUrl}
                          alt={album.title}
                          className="w-full h-32 rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <p className="text-sm font-medium text-white truncate">
                        {album.title}
                      </p>
                      <p className="text-xs text-zinc-400">{album.releaseYear}</p>
                      <Link
                        to={`/albums/${album._id}`}
                        className="text-sky-400 hover:underline text-sm block mt-1"
                      >
                        View Album
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div> */}
          </motion.section>

          {/* Related Artists */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white font-outfit">
              Related Artists
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <Card className="group bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="relative mb-3">
                          <img
                            src={currentArtist.imageUrl}
                            alt="Related Artist"
                            className="w-24 h-24 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <p className="text-sm font-medium text-white truncate">
                          Artist {i + 1}
                        </p>
                        <p className="text-xs text-zinc-400">Similar Artist</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </motion.section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ArtistPage;
