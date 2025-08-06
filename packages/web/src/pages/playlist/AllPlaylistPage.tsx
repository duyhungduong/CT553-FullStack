import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState, useCallback } from "react";
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
import debounce from "lodash/debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import Header from "./components/Header";

const AllPlaylistPage = () => {
  const {
    playlists,
    fetchPlaylists,
    isLoading,
    error,
    currentPlaylistPage, // Sử dụng currentPlaylistPage thay vì currentPage
    totalPlaylistPages, // Sử dụng totalPlaylistPages thay vì totalPages
    songsPerPlaylistPage, // Limit cho playlist
  } = useMusicStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "liked" | "created">("all");

  const limit = songsPerPlaylistPage; // Sử dụng giá trị từ store

  useEffect(() => {
    fetchPlaylists(currentPlaylistPage, limit);
  }, [fetchPlaylists, currentPlaylistPage, limit]);

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleFilterChange = (value: "all" | "liked" | "created") => {
    setFilter(value);
    // Optionally fetch filtered playlists from backend
  };

  const filteredPlaylists = playlists.filter((playlist) => {
    const matchesSearch = playlist.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filter === "all") return matchesSearch;
    // if (filter === "liked") return matchesSearch && playlist.isLiked;
    // if (filter === "created") return matchesSearch && playlist.isCreated;
    return matchesSearch;
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPlaylistPages) {
      fetchPlaylists(page, limit);
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 bg-zinc-900">
        Error: {error}
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
                <Link to={"/playlists"}>Playlists</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <Header title="All Playlists" />
      {/* Main Content */}
      <ScrollArea className="h-[calc(100vh-184px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Hero Section */}
          <section className="relative h-[40vh] flex items-center justify-center bg-gradient-to-br from-blue-500/20 via-zinc-900 to-black">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
            <div className="relative z-10 text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
                All Playlists
              </h1>
              <p className="mt-2 text-lg text-zinc-300 max-w-2xl">
                Discover {filteredPlaylists.length} playlists across all genres
                and artists.
              </p>
            </div>
          </section>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title and Filters */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
              Your Playlists
            </h1>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Input
                type="search"
                placeholder="Search playlists..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full sm:w-64 rounded-md border-zinc-700 bg-zinc-800 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
              />
              <Select onValueChange={handleFilterChange} defaultValue="all">
                <SelectTrigger className="w-[140px] rounded-md border-zinc-700 bg-zinc-800 text-white focus:ring-sky-500">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="liked">Liked</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Playlist List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <div className="text-center text-zinc-400 py-12">
                Loading playlists...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredPlaylists.length > 0 ? (
                  filteredPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="group bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden rounded-lg">
                        <CardContent className="p-4">
                          <div className="relative mb-3">
                            <Badge className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-md font-outfit z-10">
                              Playlist
                            </Badge>
                            <img
                              src={
                                playlist.imageUrl || "/default-playlist.jpeg"
                              }
                              alt={playlist.title}
                              className="w-full h-40 rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="text-center truncate">
                            <Link
                              to={`/playlists/${playlist._id}`}
                              className="font-medium text-base text-white hover:text-sky-400 truncate block transition-colors"
                            >
                              {playlist.title}
                            </Link>
                            <p className="text-xs text-zinc-400 truncate">
                              {playlist.total_tracks || 0} songs
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-zinc-400 col-span-full text-center py-12">
                    No playlists found matching your search.
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPlaylistPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12"
            >
              <Pagination>
                <PaginationContent className="flex justify-center gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPlaylistPage - 1)}
                      className={`rounded-md ${
                        currentPlaylistPage === 1
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-zinc-700"
                      }`}
                    />
                  </PaginationItem>

                  {currentPlaylistPage > 2 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                        className="rounded-md hover:bg-zinc-700"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {currentPlaylistPage > 3 && <PaginationEllipsis />}

                  {Array.from({ length: totalPlaylistPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === currentPlaylistPage ||
                        page === currentPlaylistPage - 1 ||
                        page === currentPlaylistPage + 1
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPlaylistPage === page}
                          className={`rounded-md ${
                            currentPlaylistPage === page
                              ? "bg-sky-500 text-white"
                              : "hover:bg-zinc-700"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {currentPlaylistPage < totalPlaylistPages - 2 && (
                    <PaginationEllipsis />
                  )}
                  {currentPlaylistPage < totalPlaylistPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPlaylistPages)}
                        className="rounded-md hover:bg-zinc-700"
                      >
                        {totalPlaylistPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPlaylistPage + 1)}
                      className={`rounded-md ${
                        currentPlaylistPage === totalPlaylistPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-zinc-700"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AllPlaylistPage;