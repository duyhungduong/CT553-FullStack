import { Playlist } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import { Card, CardContent } from "@/components/ui/card";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/clerk-react";

type PlaylistSectionProps = {
  title: string;
  playlists: Playlist[];
  isLoading: boolean;
  itemsPerPage?: number;
};

const PlaylistSection = ({
  playlists,
  title,
  isLoading,
  itemsPerPage = 6,
}: PlaylistSectionProps) => {
  const { fetchPlaylists } = useMusicStore();
  const { playPlaylist } = usePlayerStore();
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán phân trang
  const totalPages = Math.ceil(playlists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlaylists = playlists.slice(startIndex, endIndex);

  const { userId } = useAuth();
  useEffect(() => {
    fetchPlaylists(1, 100); // Lấy tất cả playlist (giả định 100 là đủ)
  }, [fetchPlaylists]);

  const handlePlayPlaylist = (playlist: Playlist, index: number) => {
    if (!playlist.tracks || playlist.tracks.length === 0) {
      toast.error("This playlist is empty");
      return;
    }
    playPlaylist(playlist.tracks, userId || "", index, playlist._id);
    toast.success(`Playing ${playlist.title}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  if (playlists.length === 0) return null;
  // if (isLoading) return <SectionGridSkeleton />;

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight font-outfit">
          {title}
        </h2>
        <Button
          variant="link"
          className="text-sm text-zinc-400 hover:text-sky-500 transition-colors"
          asChild
        >
          <Link to="/playlists">Show all</Link>
        </Button>
      </div>

      {/* Grid */}
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <AnimatePresence mode="wait">
            {paginatedPlaylists.map((playlist, index) => (
              <motion.div
                key={`${playlist._id}-${currentPage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-4 relative">
                    {/* Image */}
                    <div className="relative mb-3">
                      <div
                        className="aspect-square rounded-lg overflow-hidden shadow-md"
                        style={
                          playlist.imageUrl?.startsWith("linear-gradient")
                            ? { background: playlist.imageUrl }
                            : {}
                        }
                      >
                        {/* Nếu imageUrl là URL ảnh, hiển thị bằng <img> */}
                        {!playlist.imageUrl?.startsWith("linear-gradient") && (
                          <img
                            src={playlist.imageUrl || "/default-playlist.jpeg"}
                            alt={playlist.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      {playlist.tracks && (
                        <div onClick={() => handlePlayPlaylist(playlist, 0)}>
                          <PlayButton
                            song={playlist.tracks?.[0]} // Phát bài đầu tiên nếu có
                            songs={playlist.tracks || []}
                          />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center truncate">
                      <Link
                        to={
                          playlist._id.startsWith("daily-mix")
                            ? `/daily-mix/${playlist._id}`
                            : `/playlists/${playlist._id}`
                        }
                        className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                      >
                        {playlist.title}
                      </Link>
                      <p className="text-xs text-zinc-400 truncate">
                        {playlist.total_tracks || 0} songs • By{" "}
                        {playlist.user?.name ||
                          `User #${playlist.userId.slice(-6)}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`${
                    currentPage === page
                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                  }`}
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </Button>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistSection;