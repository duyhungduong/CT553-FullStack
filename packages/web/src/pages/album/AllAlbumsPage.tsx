import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMusicStore } from "@/stores/useMusicStore";
import { Music } from "lucide-react";
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
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion, AnimatePresence } from "framer-motion";
import { formatDuration } from "@/utils/formatDuration";

const AllAlbumsPage = () => {
  const {
    albums,
    fetchAlbums,
    isLoading,
    error,
    currentAlbumPage,
    totalAlbumPages,
  } = useMusicStore();

  const limit = 20; // Giới hạn 20 album mỗi trang
  const [searchQuery, setSearchQuery] = useState(""); // State cho tìm kiếm
  const [sortBy, setSortBy] = useState<"title" | "artist" | "trackCount">(
    "title"
  ); // State cho sắp xếp

  useEffect(() => {
    fetchAlbums(currentAlbumPage, limit);
  }, [fetchAlbums, currentAlbumPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalAlbumPages) {
      fetchAlbums(page, limit);
    }
  };

  // Lọc và sắp xếp album dựa trên searchQuery và sortBy
  const filteredAlbums = albums
    .filter(
      (album) =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "artist")
        return (a.artist?.name || "").localeCompare(b.artist?.name || "");
      if (sortBy === "trackCount")
        return (a.tracks?.length || 0) - (b.tracks?.length || 0);
      return 0;
    });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-950">
        <div className="flex items-center gap-2">
          <Music className="animate-out h-6 w-6 text-rose-500" />
          <span>Loading albums...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 bg-zinc-950">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-lg shadow-md">
        <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
        <Separator orientation="vertical" className="h-6 bg-zinc-800" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-400">
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-500 transition-colors">
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-600" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sky-500 font-semibold">
                <Link to={"/albums"}>Albums</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <ScrollArea className="h-[calc(100vh-124px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Hero Section */}
          <section className="relative h-[40vh] flex items-center justify-center bg-gradient-to-br from-rose-500/20 via-zinc-900 to-black">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
            <div className="relative z-10 text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
                All Albums
              </h1>
              <p className="mt-2 text-lg text-zinc-300 max-w-2xl">
                Explore {albums.length} albums from your favorite artists.
              </p>
            </div>
          </section>

          {/* Albums Grid */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Music className="h-6 w-6 text-rose-500" /> Your Album
                Collection
              </h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Search albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] sm:w-[300px] bg-zinc-800/50 border-zinc-700 text-white rounded-full"
                />
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as any)}
                >
                  <SelectTrigger className="w-[150px] bg-zinc-800/50 border-zinc-700 text-white rounded-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="trackCount">Track Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AnimatePresence>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredAlbums.map((album, index) => (
                  <motion.div
                    key={album._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4 relative">
                        <div className="relative mb-3">
                          <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                            <img
                              src={
                                album.imageUrl ||
                                "https://via.placeholder.com/300x300"
                              }
                              alt={album.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <Button
                            size="icon"
                            className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-rose-500 hover:bg-rose-400 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            asChild
                          >
                            <Link to={`/albums/${album._id}`}>
                              <Music className="h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                        <div className="text-center">
                          <Link
                            to={`/albums/${album._id}`}
                            className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                          >
                            {album.title}
                          </Link>
                          <Link
                            to={`/artists/${album.artist?._id}`}
                            className="text-xs text-zinc-400 hover:text-sky-400 transition-colors duration-200 truncate block"
                          >
                            {album.artist?.name || "Unknown Artist"}
                          </Link>
                          <Badge
                            variant="secondary"
                            className="mt-1 bg-rose-800/90 text-white text-xs px-1 rounded-md"
                          >
                            Album • {album.total_tracks || 0} tracks •{" "}
                            {formatDuration(album.total_duration)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {/* Thông báo khi không tìm thấy */}
            {filteredAlbums.length === 0 && (
              <p className="text-center text-zinc-400 mt-8">
                No albums match your search.
              </p>
            )}

            {/* Pagination */}
            {totalAlbumPages > 1 && (
              <Pagination className="mt-12">
                <PaginationContent className="bg-zinc-800/50 rounded-full p-2 shadow-md">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentAlbumPage - 1)}
                      className={`rounded-full hover:bg-zinc-700 transition-colors ${
                        currentAlbumPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>

                  {currentAlbumPage > 2 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                        className="rounded-full hover:bg-zinc-700 transition-colors"
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
                          className={`rounded-full hover:bg-zinc-700 transition-colors ${
                            currentAlbumPage === page
                              ? "bg-rose-500 text-white"
                              : ""
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
                        className="rounded-full hover:bg-zinc-700 transition-colors"
                      >
                        {totalAlbumPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentAlbumPage + 1)}
                      className={`rounded-full hover:bg-zinc-700 transition-colors ${
                        currentAlbumPage === totalAlbumPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AllAlbumsPage;
