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
import { Artist } from "@/types";
import {
  Calendar,
  Loader2,
  ArrowDownAz,
  ArrowUpZa,
  MapPin,
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
import ShowDetailArtist from "./ShowDetailArtist";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";

const ArtistTable = () => {
  const {
    artists,
    fetchArtists,
    deleteArtist,
    isLoading,
    error,
    currentArtistPage,
    totalArtistPages,
  } = useMusicStore();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Artist | "songsLength" | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  useEffect(() => {
    fetchArtists(1, 20); // Adjusted to a reasonable limit per page
  }, [fetchArtists]);

  // Sorting logic
  const sortedArtists = [...artists].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === "songsLength") {
      aValue = a.songs?.length || 0;
      bValue = b.songs?.length || 0;
    } else {
      aValue = a[sortConfig.key as keyof Artist];
      bValue = b[sortConfig.key as keyof Artist];
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

  const handleSort = (key: keyof Artist | "songsLength") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const debouncedFetchArtists = debounce((page: number, limit: number) => {
    fetchArtists(page, limit);
  }, 300);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalArtistPages) {
      debouncedFetchArtists(newPage, 20);
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
              onClick={() => handleSort("name")}
              className="text-zinc-300 cursor-pointer"
            >
              Name
              {sortConfig.key === "name" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDownAz className="inline ml-1 size-4" />
                ) : (
                  <ArrowUpZa className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300">Bio</TableHead>
            <TableHead
              onClick={() => handleSort("country")}
              className="text-zinc-300 cursor-pointer"
            >
              Country
              {sortConfig.key === "country" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDownAz className="inline ml-1 size-4" />
                ) : (
                  <ArrowUpZa className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => handleSort("songsLength")}
              className="hidden md:table-cell text-zinc-300 cursor-pointer"
            >
              Songs
              {sortConfig.key === "songsLength" &&
                (sortConfig.direction === "asc" ? (
                  <ArrowDownAz className="inline ml-1 size-4" />
                ) : (
                  <ArrowUpZa className="inline ml-1 size-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => handleSort("createdAt")}
              className="hidden md:table-cell text-zinc-300 cursor-pointer"
            >
              Created At
              {sortConfig.key === "createdAt" &&
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
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin size-8 text-emerald-500" />
                    <span className="ml-2 text-zinc-400">Loading artists...</span>
                  </div>
                </TableCell>
              </motion.tr>
            ) : sortedArtists.length === 0 ? (
              <motion.tr
                key="no-artists"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TableCell colSpan={7} className="text-center py-10 text-zinc-400">
                  No artists found.
                </TableCell>
              </motion.tr>
            ) : (
              sortedArtists.map((artist, index) => (
                <motion.tr
                  key={artist._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/70 transition-colors duration-200"
                >
                  <TableCell>
                    <div className="relative group">
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-12 h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    <ShowDetailArtist artist={artist} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400">
                    {artist.bio && artist.bio.length > 100
                      ? `${artist.bio.substring(0, 100)}...`
                      : artist.bio || "No bio available"}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      {artist.country || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Music className="size-4" />
                      {artist.songs?.length || "0"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-4" />
                      {artist.createdAt?.split("T")[0] || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteArtist(artist._id)}
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
      {totalArtistPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center p-4 border-t border-zinc-700/50"
        >
          <div className="text-zinc-400 text-sm hidden md:block">
            Showing {artists.length} of {totalArtistPages * 20} artists
          </div>
          <Pagination>
            <PaginationContent className="bg-zinc-800/50 rounded-full p-2 shadow-md">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentArtistPage - 1)}
                  className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                    currentArtistPage === 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                />
              </PaginationItem>

              {currentArtistPage > 2 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(1)}
                    className="rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              {currentArtistPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {Array.from({ length: totalArtistPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === currentArtistPage ||
                    page === currentArtistPage - 1 ||
                    page === currentArtistPage + 1
                )
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentArtistPage === page}
                      className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                        currentArtistPage === page ? "bg-emerald-600 text-white" : ""
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {currentArtistPage < totalArtistPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {currentArtistPage < totalArtistPages - 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(totalArtistPages)}
                    className="rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors"
                  >
                    {totalArtistPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentArtistPage + 1)}
                  className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                    currentArtistPage === totalArtistPages
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

export default ArtistTable;