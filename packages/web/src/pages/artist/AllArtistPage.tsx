import { Badge } from "@/components/ui/badge";
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
import { Users } from "lucide-react"; // Thay Music bằng Users cho artist
import { useEffect, useRef, useState } from "react";
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
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";

const AllArtistPage = () => {
  const {
    artists,
    fetchArtists,
    isLoading,
    error,
    currentArtistPage,
    totalArtistPages,
  } = useMusicStore();

  const limit = 20; // Giới hạn 20 nghệ sĩ mỗi trang
  const [searchQuery, setSearchQuery] = useState(""); // State cho tìm kiếm
  const [sortBy, setSortBy] = useState<"name" | "country">("name"); // State cho sắp xếp
  const directoryRef = useRef<HTMLHeadingElement>(null); // Ref cho h2

  useEffect(() => {
    if (!artists.length) fetchArtists(currentArtistPage, limit);
  }, [fetchArtists, currentArtistPage, artists]);

  const debouncedFetchArtists = debounce((page: number, limit: number) => {
    fetchArtists(page, limit);
  }, 300);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalArtistPages) {
      debouncedFetchArtists(newPage, limit);
      setTimeout(() => {
        directoryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100); // Delay nhỏ để đảm bảo dữ liệu đã tải
    }
  };

  // Lọc và sắp xếp nghệ sĩ dựa trên searchQuery và sortBy
  const filteredArtists = artists
    .filter(
      (artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.country?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "country")
        return (a.country || "").localeCompare(b.country || "");
      return 0;
    });

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
              <BreadcrumbLink
                // href="/"
                className="hover:text-sky-500 transition-colors"
              >
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-600" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sky-500 font-semibold">
                <Link to={"/artists"}>Artists</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <Header title="All Artists" />
      <ScrollArea className="h-[calc(100vh-184px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Hero Section */}
          <section className="relative h-[40vh] flex items-center justify-center bg-gradient-to-br from-orange-500/20 via-zinc-900 to-black">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
            <div className="relative z-10 text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
                All Artists
              </h1>
              <p className="mt-2 text-lg text-zinc-300 max-w-2xl">
                Explore {artists.length} talented artists from around the world.
              </p>
            </div>
          </section>

          {/* Artists Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            ref={directoryRef}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-orange-500" /> Artists Directory
              </h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] sm:w-[300px] bg-zinc-800/50 border-zinc-700 text-white rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as any)}
                >
                  <SelectTrigger className="w-[150px] bg-zinc-800/50 border-zinc-700 text-white rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center text-zinc-400">
                <Users className="animate-spin h-6 w-6 text-orange-500 inline-block mr-2" />
                Loading artists...
              </div>
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {filteredArtists.map((artist, index) => (
                    <motion.div
                      key={artist._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                        <CardContent className="p-4 relative">
                          <div className="relative mb-3">
                            <div className="aspect-square rounded-full overflow-hidden shadow-md">
                              <img
                                src={
                                  artist.imageUrl ||
                                  "https://via.placeholder.com/300x300"
                                }
                                alt={artist.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute rounded-full inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <Badge className="absolute top-2 left-2 bg-orange-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                              Artist
                            </Badge>
                          </div>
                          <div className="text-center">
                            <Link
                              to={`/artists/${artist._id}`}
                              className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                            >
                              {artist.name}
                            </Link>
                            <p className="text-xs text-zinc-400 truncate">
                              {artist.country || "Unknown"}
                            </p>
                            {artist.songs && (
                              <Badge
                                variant="secondary"
                                className="mt-1 bg-zinc-700 text-zinc-200 text-xs"
                              >
                                {artist.songs.length} songs
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Thông báo khi không tìm thấy */}
            {!isLoading && filteredArtists.length === 0 && (
              <p className="text-center text-zinc-400 mt-8">
                No artists match your search.
              </p>
            )}

            {/* Pagination */}
            {totalArtistPages > 1 && (
              <Pagination className="mt-12">
                <PaginationContent className="bg-zinc-800/50 rounded-full p-2 shadow-md">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentArtistPage - 1)}
                      className={`rounded-full hover:bg-zinc-700 text-white border-zinc-700 transition-colors ${
                        currentArtistPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
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
                            currentArtistPage === page
                              ? "bg-orange-500 text-black"
                              : ""
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
            )}
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AllArtistPage;
