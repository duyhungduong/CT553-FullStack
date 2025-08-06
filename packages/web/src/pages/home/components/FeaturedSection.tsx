import { Song } from "@/types";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import PlayButton from "./PlayButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState, memo } from "react";

type FeaturedSectionProps = {
  title?: string;
  songs: Song[];
  isLoading: boolean;
  itemsPerPage?: number;
};

// Hàm so sánh sâu để kiểm tra mảng songs
const areSongsEqual = (prevSongs: Song[], nextSongs: Song[]): boolean => {
  if (prevSongs.length !== nextSongs.length) return false;
  return prevSongs.every((prevSong, index) => {
    const nextSong = nextSongs[index];
    return (
      prevSong._id === nextSong._id &&
      prevSong.title === nextSong.title &&
      prevSong.imageUrl === nextSong.imageUrl &&
      prevSong.artists[0]?._id === nextSong.artists[0]?._id &&
      prevSong.artists[0]?.name === nextSong.artists[0]?.name
    );
  });
};

// Memo hóa FeaturedSection
const FeaturedSection = memo(
  ({
    title = "Featured Songs",
    songs,
    isLoading,
    itemsPerPage = 6,
  }: FeaturedSectionProps) => {
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading || songs.length === 0) {
      return <FeaturedGridSkeleton />;
    }

    const initialSongs = songs.slice(0, itemsPerPage);
    const remainingSongs = songs.slice(itemsPerPage);

    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold tracking-wide text-white mb-6">
          {title}
        </h2>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {initialSongs.map((song, index) => (
                <motion.div
                  key={song._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="relative flex items-center group rounded-2xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0 flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-l-2xl transition-transform duration-300 group-hover:scale-100"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <Link
                          to={`/songs/${song._id}`}
                          className="font-semibold text-white truncate hover:text-sky-400 hover:underline transition-colors"
                        >
                          {song.title}
                        </Link>
                        <Link
                          to={`/artists/${song.artists?.[0]?._id || ""}`}
                          className="text-sm text-zinc-400 truncate hover:text-sky-400 transition-colors"
                        >
                          <p>{song.artists?.[0]?.name || "Unknown Artist"}</p>
                        </Link>
                      </div>
                      <PlayButton song={song} songs={songs} className="" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {remainingSongs.length > 0 && (
            <>
              <CollapsibleContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  <AnimatePresence>
                    {remainingSongs.map((song, index) => (
                      <motion.div
                        key={song._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="relative flex items-center group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                          <CardContent className="p-0 flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                              <img
                                src={song.imageUrl}
                                alt={song.title}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-l-2xl transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="flex-1 truncate">
                              <Link
                                to={`/songs/${song._id}`}
                                className="font-semibold text-white truncate hover:text-sky-400 transition-colors"
                              >
                                {song.title}
                              </Link>
                              <Link
                                to={`/artists/${song.artists?.[0]?._id || ""}`}
                                className="text-sm text-zinc-400 truncate hover:text-sky-400 transition-colors"
                              >
                                <p>
                                  {song.artists?.[0]?.name || "Unknown Artist"}
                                </p>
                              </Link>
                            </div>
                            <PlayButton
                              song={song}
                              songs={songs}
                              className=""
                            />
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
                    variant="ghost"
                    className="flex items-center gap-2 text-white hover:bg-zinc-700/50 transition-colors duration-300"
                  >
                    {isOpen
                      ? "Show Less"
                      : `Show More (${remainingSongs.length} more)`}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </>
          )}
        </Collapsible>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // So sánh các props với hàm so sánh sâu cho songs
    return (
      prevProps.title === nextProps.title &&
      areSongsEqual(prevProps.songs, nextProps.songs) &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.itemsPerPage === nextProps.itemsPerPage
    );
  }
);

export default FeaturedSection;
