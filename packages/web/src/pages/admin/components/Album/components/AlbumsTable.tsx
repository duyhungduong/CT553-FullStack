import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/stores/useMusicStore";
import { Album } from "@/types";
import { formatDuration } from "@/utils/formatDuration";
import {
  Calendar,
  Loader2,
  ArrowDownAz,
  ArrowUpZa,
  ArrowDown10,
  ArrowUp01,
  Music,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import ShowDetailAlbum from "./ShowDetailAlbum";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";

const AlbumsTable = () => {
  const {
    albums,
    deleteAlbum,
    fetchAlbums,
    fetchAlbumTracks,
    albumtracks,
    isLoading,
    error,
    currentAlbumPage,
    totalAlbumPages,
  } = useMusicStore();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Album | "artistName" | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  useEffect(() => {
    fetchAlbums(1, 20); // Adjusted to a reasonable limit per page
    fetchAlbumTracks();
  }, [fetchAlbums, fetchAlbumTracks]);

  // Sorting logic
  const sortedAlbums = [...albums].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === "artistName") {
      aValue = a.artist?.name || "";
      bValue = b.artist?.name || "";
    } else {
      aValue = a[sortConfig.key as keyof Album];
      bValue = b[sortConfig.key as keyof Album];
    }

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

  const debouncedFetchAlbums = debounce((page: number, limit: number) => {
    fetchAlbums(page, limit);
  }, 300);

  const handleSort = (key: keyof Album | "artistName") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalAlbumPages) {
      debouncedFetchAlbums(newPage, 20);
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
            <TableHead
              onClick={() => handleSort("artistName")}
              className="hidden md:table-cell text-zinc-300 cursor-pointer"
            >
              Artist
              {sortConfig.key === "artistName" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDownAz className="inline ml-1 size-4" />
                ) : (
                  <ArrowUpZa className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300">Description</TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300">Tracks</TableHead>
            <TableHead
              onClick={() => handleSort("total_tracks")}
              className="hidden sm:table-cell text-zinc-300 cursor-pointer"
            >
              Total Tracks
              {sortConfig.key === "total_tracks" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDown10 className="inline ml-1 size-4" />
                ) : (
                  <ArrowUp01 className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => handleSort("total_duration")}
              className="hidden sm:table-cell text-zinc-300 cursor-pointer"
            >
              Total Duration
              {sortConfig.key === "total_duration" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDown10 className="inline ml-1 size-4" />
                ) : (
                  <ArrowUp01 className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => handleSort("releaseYear")}
              className="text-zinc-300 cursor-pointer"
            >
              Release Year
              {sortConfig.key === "releaseYear" &&
                (sortConfig.direction === "asc" ? (
                  <Calendar className="inline ml-1 size-4" />
                ) : (
                  <Calendar className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead className="text-right text-zinc-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
                    <span className="ml-2 text-zinc-400">Loading albums...</span>
                  </div>
                </TableCell>
              </motion.tr>
            ) : sortedAlbums.length === 0 ? (
              <motion.tr
                key="no-albums"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TableCell colSpan={9} className="text-center py-10 text-zinc-400">
                  No albums found.
                </TableCell>
              </motion.tr>
            ) : (
              sortedAlbums.map((album, index) => (
                <motion.tr
                  key={album._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/70 transition-colors duration-200"
                >
                  <TableCell>
                    <div className="relative group">
                      <img
                        src={album.imageUrl}
                        alt={album.title}
                        className="w-12 h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    <ShowDetailAlbum album={album} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400 max-w-40 truncate">
                    {album.artist?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400 max-w-40 truncate">
                    {album.description && album.description.length > 50
                      ? `${album.description.substring(0, 50)}...`
                      : album.description || "No description"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400 max-w-[200px] truncate">
                    <span className="inline-flex items-center gap-1">
                      <Music className="size-4" />
                      {albumtracks && albumtracks.length > 0
                        ? albumtracks
                            .filter((track) => track.album_id._id === album._id)
                            .map((track) => track.track_id.title)
                            .join(", ")
                        : "No tracks"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-zinc-400">
                    {album.total_tracks || 0}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-zinc-400">
                    {formatDuration(album.total_duration) || "0:00"}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-4" />
                      {album.releaseYear || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlbum(album._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalAlbumPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center p-4 border-t border-zinc-700/50"
        >
          <div className="text-zinc-400 text-sm hidden md:block">
            Showing {albums.length} of {totalAlbumPages * 20} albums
          </div>
          <Pagination>
            <PaginationContent className="bg-zinc-800/50 rounded-full p-2 shadow-md">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentAlbumPage - 1)}
                  className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                    currentAlbumPage === 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                />
              </PaginationItem>

              {currentAlbumPage > 2 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(1)}
                    className="rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              {currentAlbumPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {Array.from({ length: totalAlbumPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === currentAlbumPage ||
                    page === currentAlbumPage - 1 ||
                    page === currentAlbumPage + 1
                )
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentAlbumPage === page}
                      className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                        currentAlbumPage === page ? "bg-emerald-600 text-white" : ""
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {currentAlbumPage < totalAlbumPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {currentAlbumPage < totalAlbumPages - 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(totalAlbumPages)}
                    className="rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors"
                  >
                    {totalAlbumPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentAlbumPage + 1)}
                  className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                    currentAlbumPage === totalAlbumPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </div>
  );
};

export default AlbumsTable;