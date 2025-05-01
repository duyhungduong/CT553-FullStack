import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Link } from "react-router-dom";
import AddToFavorite from "./AddToFavorite";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDuration } from "@/utils/formatDuration";
import PlayButton from "./PlayButton";
import { GripVertical, Play, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/utils/timeFormatter";
import { useChatStore } from "@/stores/useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const QueueTable = () => {
  const { queue, currentSong, isPlaying, playbackPosition, removeFromQueue } =
    usePlayerStore();
  const { info } = useChatStore();

  const handleRemoveFromQueue = async (queueItemId: string) => {
    if (info) {
      await removeFromQueue(info._id, queueItemId);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800/50 overflow-hidden">
      <ScrollArea className="h-full">
        <Table className="w-full overflow-hidden overflow-y-hidden">
          <TableHeader>
            <TableRow className="bg-zinc-800/50 border-b border-zinc-700/50 hover:bg-zinc-800 transition-colors duration-200">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[40px] text-zinc-300">#</TableHead>
              <TableHead className="w-[60px] text-zinc-300">Image</TableHead>
              <TableHead className="text-zinc-300">Title</TableHead>
              <TableHead className="text-zinc-300">Album</TableHead>
              <TableHead className="hidden md:table-cell text-zinc-300">
                Streams
              </TableHead>
              <TableHead className="hidden md:table-cell text-zinc-300">
                Genre
              </TableHead>
              <TableHead className="hidden md:table-cell text-zinc-300">
                Instrument
              </TableHead>
              <TableHead className="hidden md:table-cell text-zinc-300">
                Added
              </TableHead>
              <TableHead className="text-right text-zinc-300">
                Duration
              </TableHead>
              <TableHead className="text-right text-zinc-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {queue.length === 0 ? (
                <motion.tr
                  key="no-songs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TableCell
                    colSpan={11}
                    className="text-center py-10 text-zinc-400"
                  >
                    No songs in queue. Add some to get started!
                  </TableCell>
                </motion.tr>
              ) : (
                queue.map((song, index) => {
                  const isCurrentSong = currentSong?._id === song._id;
                  // const duration = durations[index] || 0;
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
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`border-b border-zinc-800/50 ${
                          isCurrentSong
                            ? "bg-gradient-to-r from-emerald-900/20 to-zinc-800/50"
                            : "hover:bg-zinc-800/70"
                        } transition-colors duration-200`}
                      >
                        <TableCell className="w-[40px]">
                          <GripVertical className="h-4 w-4 text-zinc-500 hover:text-zinc-300 transition-colors duration-200 cursor-grab" />
                        </TableCell>
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
                              src={song.imageUrl}
                              alt={song.title}
                              className="w-12 h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <PlayButton
                              song={song}
                              className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-full p-2"
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
                              {song.title}
                            </span>
                            <Link
                              to={`/artists/${song.artists[0]._id}`}
                              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors duration-200 truncate max-w-[200px]"
                            >
                              {song.artists[0].name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="truncate min-w-[150px] max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  to={`/albums/${song.album?._id}`}
                                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors duration-200 truncate inline-block"
                                >
                                  {song.album?.title || "Single"}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{song.album?.title || "Single"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-zinc-400">
                          {song.streams.toLocaleString("en-US")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-zinc-400 truncate max-w-[100px]">
                          <Link
                            to={`/genres/${song.genres[0]?._id}`}
                            className="hover:text-sky-400 transition-colors"
                          >
                            #{song.genres[0]?.name || "Unknown"}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-zinc-400 truncate max-w-[100px]">
                          <Link
                            to={`/instruments/${song.instruments[0]?._id}`}
                            className="hover:text-sky-400 transition-colors"
                          >
                            #{song.instruments[0]?.name || "Unknown"}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-zinc-400">
                          {song.createdAt &&
                          !isNaN(new Date(song.createdAt).getTime())
                            ? new Date(song.createdAt).toLocaleString([], {
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : formatTimeAgo(song.createdAt)}
                        </TableCell>
                        <TableCell className="text-right text-zinc-400 text-sm">
                          {formatDuration(song.duration)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end items-center">
                            <AddToFavorite songId={song._id} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromQueue(song._id)}
                              className="text-zinc-400 hover:text-red-500 hover:bg-red-900/20 rounded-full p-1 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                      {/* Progress bar ngay dưới bài hát đang phát */}
                      {isCurrentSong && isPlaying && (
                        <motion.tr
                          key={`${song._id}-progress`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell colSpan={11} className="p-0">
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
    </div>
  );
};

export default QueueTable;
