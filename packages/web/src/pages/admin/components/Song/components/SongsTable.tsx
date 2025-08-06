import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import {
  Calendar,
  Loader2,
  ArrowDownAz,
  ArrowUpZa,
  ArrowDown10,
  ArrowUp01,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";
import { useState } from "react";
import AlertDeleteSongDialog from "./AlertDeleteSongDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import ShowDetailSong from "./ShowDetailSong";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";

const SongsTable = () => {
  const {
    songs,
    isLoading,
    error,
    fetchSongs,
    totalSongs,
    currentPage,
    songsPerPage,
    totalPages,
  } = useMusicStore();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Song | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const sortedSongs = [...songs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const handleSort = (key: keyof Song) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const debouncedFetchSongs = debounce((page, limit) => {
    fetchSongs(page, limit);
  }, 300);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      debouncedFetchSongs(newPage, songsPerPage);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-10 text-red-400 bg-red-900/10 rounded-lg p-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800/50 overflow-hidden overflow-y-hidden">
      <Table className="w-full overflow-hidden overflow-y-hidden">
        <TableHeader>
          <TableRow className="bg-zinc-800/50 border-b border-zinc-700/50 hover:bg-zinc-800 transition-colors duration-200">
            <TableHead className="w-[60px] text-zinc-300">Image</TableHead>
            <TableHead
              onClick={() => handleSort("title")}
              className="text-zinc-300 cursor-pointer"
            >
              Title
              {sortConfig.key === "title" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDownAz className="inline ml-1 size-4" />
                ) : (
                  <ArrowUpZa className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead className="text-zinc-300">Artist</TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300">Genre</TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300">Instrument</TableHead>
            <TableHead
              onClick={() => handleSort("streams")}
              className="hidden lg:table-cell text-zinc-300 cursor-pointer"
            >
              Streams
              {sortConfig.key === "streams" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDown10 className="inline ml-1 size-4" />
                ) : (
                  <ArrowUp01 className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => handleSort("likes")}
              className="hidden lg:table-cell text-zinc-300 cursor-pointer"
            >
              Likes
              {sortConfig.key === "likes" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDown10 className="inline ml-1 size-4" />
                ) : (
                  <ArrowUp01 className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => handleSort("createdAt")}
              className="hidden lg:table-cell text-zinc-300 cursor-pointer"
            >
              Release Date
              {sortConfig.key === "createdAt" &&
                (sortConfig.direction === "asc" ? (
                  <CalendarArrowDown className="inline ml-1 size-4" />
                ) : (
                  <CalendarArrowUp className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead className="text-right text-zinc-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.tr
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin size-8 text-emerald-500" />
                    <span className="ml-2 text-zinc-400">Loading songs...</span>
                  </div>
                </TableCell>
              </motion.tr>
            ) : sortedSongs.length === 0 ? (
              <motion.tr
                key="no-songs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TableCell colSpan={9} className="text-center py-10 text-zinc-400">
                  No songs found.
                </TableCell>
              </motion.tr>
            ) : (
              sortedSongs.map((song, index) => (
                <motion.tr
                  key={song._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/70 transition-colors duration-200"
                >
                  <TableCell>
                    <div className="relative group">
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    <ShowDetailSong song={song} />
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {song.artists?.length > 0
                      ? song.artists.map((a) => a.name).join(", ")
                      : "Unknown Artist"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400">
                    {song.genres?.length > 0
                      ? song.genres.map((g) => g.name).join(", ")
                      : "No genres"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400">
                    {song.instruments?.length > 0
                      ? song.instruments.map((i) => i.name).join(", ")
                      : "No instruments"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-zinc-400">
                    {song.streams?.toLocaleString() || "0"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-zinc-400">
                    {song.likes?.toLocaleString() || "0"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-4" />
                      {song.createdAt?.split("T")[0] || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDeleteSongDialog songId={song._id} />
                  </TableCell>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center p-4 border-t border-zinc-700/50"
      >
        <div className="text-zinc-400 text-sm hidden md:block">
          Showing {songs.length} of {totalSongs} songs
        </div>
        {totalPages > 1 && (
          <Pagination>
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
                        currentPage === page ? "bg-emerald-600 text-white" : ""
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
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </motion.div>
    </div>
  );
};

export default SongsTable;