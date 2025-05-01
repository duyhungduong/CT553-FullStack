import { Artist } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Music, ChevronDown, CircleUserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

type SectionGridProps = {
  title: string;
  artists: Artist[];
};

const ArtistSectionGrid = ({ artists, title }: SectionGridProps) => {
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng Collapsible
  const initialDisplayCount = 6; // Số lượng nghệ sĩ hiển thị ban đầu

  if ( artists.length === 0) {
    return <SectionGridSkeleton />;
  }

  // Chia artists thành phần hiển thị ban đầu và phần collapsible
  const initialArtists = artists.slice(0, initialDisplayCount);
  const remainingArtists = artists.slice(initialDisplayCount);

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wide text-white flex items-center gap-2">
          <Music className="h-6 w-6 text-orange-500" /> {title}
        </h2>
        <Button
          variant="link"
          className="text-sm text-zinc-400 hover:text-sky-500 transition-colors duration-200"
          asChild
        >
          <Link to="/artists">Show all</Link>
        </Button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        <AnimatePresence>
          {initialArtists.map((artist, index) => (
            <motion.div
              key={artist._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4">
                  {/* Image */}
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
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <Button
                      size="icon"
                      className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-400 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      asChild
                    >
                      <Link to={`/artists/${artist._id}`}>
                        <CircleUserRound className="h-5 w-5" />
                      </Link>
                    </Button>
                    {/* Artist Label */}
                    <div className="absolute top-2 left-2 bg-orange-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                      Artist
                    </div>
                  </div>

                  {/* Name & Info */}
                  <div className="text-center">
                    <Link
                      to={`/artists/${artist._id}`}
                      className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                    >
                      {artist.name}
                    </Link>
                    {/* Badge số lượng bài hát (nếu có dữ liệu songs) */}
                    {artist.songs && (
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-orange-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit"
                      >
                        {artist.songs.length} songs
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Collapsible Section */}
      {remainingArtists.length > 0 && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
          <CollapsibleContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
              <AnimatePresence>
                {remainingArtists.map((artist, index) => (
                  <motion.div
                    key={artist._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4">
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
                          <Button
                            size="icon"
                            className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-400 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            asChild
                          >
                            <Link to={`/artists/${artist._id}`}>
                              <CircleUserRound className="h-5 w-5" />
                            </Link>
                          </Button>
                          <div className="absolute top-2 left-2 bg-orange-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                            Artist
                          </div>
                        </div>
                        <div className="text-center">
                          <Link
                            to={`/artists/${artist._id}`}
                            className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                          >
                            {artist.name}
                          </Link>
                          {artist.songs && (
                            <Badge
                              variant="secondary"
                              className="mt-1 bg-orange-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit"
                            >
                              {artist.songs.length} songs
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CollapsibleContent>
          <div className="flex justify-end mt-6">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className=" bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700/90 transition-all duration-200 rounded-full"
              >
                {isOpen ? "Show Less" : "Show More"} ({remainingArtists.length}{" "}
                more)
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </Collapsible>
      )}
    </div>
  );
};

export default ArtistSectionGrid;
