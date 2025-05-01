import { Album } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { Music, Plus, ChevronDown, Disc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { formatDuration } from "@/utils/formatDuration";

type SectionGridProps = {
  title: string;
  albums: Album[];
};

const SectionAlbumGrid = ({ albums, title }: SectionGridProps) => {
  const { playlists } = useMusicStore();
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng Collapsible
  const initialDisplayCount = 6; // Số lượng album hiển thị ban đầu

  if ( albums.length === 0) {
    return null;
  }

  // Chia albums thành phần hiển thị ban đầu và phần collapsible
  const initialAlbums = albums.slice(0, initialDisplayCount);
  const remainingAlbums = albums.slice(initialDisplayCount);

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wide text-white flex items-center gap-2">
          <Music className="h-6 w-6 text-rose-500" /> {title}
        </h2>
        <Button
          variant="link"
          className="text-sm text-zinc-400 hover:text-sky-500 transition-colors duration-200"
          asChild
        >
          <Link to="/albums">Show all</Link>
        </Button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {/* Hiển thị album ban đầu */}
        <AnimatePresence>
          {initialAlbums.map((album, index) => (
            <motion.div
              key={album._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ContextMenu>
                <ContextMenuTrigger>
                  <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-4">
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
                            <Disc className="h-5 w-5" />
                          </Link>
                        </Button>
                        <div className="absolute top-2 left-2 bg-rose-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                          Album
                        </div>
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
                          className="mt-1 bg-rose-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit"
                        >
                          {album.total_tracks || 0} tracks • {formatDuration(album.total_duration) }
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64 bg-zinc-800 border-zinc-700 text-white">
                  <ContextMenuItem className="hover:bg-zinc-700">
                    Play Album
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-zinc-700" />
                  <ContextMenuSub>
                    <ContextMenuSubTrigger className="hover:bg-zinc-700">
                      Add to Playlist
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48 bg-zinc-800 border-zinc-700 text-white">
                      <ScrollArea className="max-h-48">
                        {playlists.length > 0 ? (
                          playlists.map((playlist) => (
                            <ContextMenuItem
                              key={playlist._id}
                              className="hover:bg-zinc-700 truncate"
                            >
                              {playlist.title}
                            </ContextMenuItem>
                          ))
                        ) : (
                          <ContextMenuItem disabled>
                            No playlists available
                          </ContextMenuItem>
                        )}
                        <ContextMenuSeparator className="bg-zinc-700" />
                        <ContextMenuItem className="hover:bg-zinc-700 flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Create New Playlist
                        </ContextMenuItem>
                      </ScrollArea>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSeparator className="bg-zinc-700" />
                  <ContextMenuItem className="hover:bg-zinc-700">
                    Share
                  </ContextMenuItem>
                  <ContextMenuItem className="hover:bg-zinc-700">
                    View Album Details
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Collapsible Section */}
      {remainingAlbums.length > 0 && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
          <CollapsibleContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
              <AnimatePresence>
                {remainingAlbums.map((album, index) => (
                  <motion.div
                    key={album._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <Card className="group rounded-xl bg-zinc-800/50 border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                          <CardContent className="p-4">
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
                                  <Disc className="h-5 w-5" />
                                </Link>
                              </Button>
                              <div className="absolute top-2 left-2 bg-rose-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                                Album
                              </div>
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
                                className="mt-1 bg-rose-800/90 text-white text-xs px-2 py-1 rounded-md font-outfit"
                              >
                                {album.total_tracks || 0} tracks • {formatDuration(album.total_duration)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64 bg-zinc-800 border-zinc-700 text-white">
                        <ContextMenuItem className="hover:bg-zinc-700">
                          Play Album
                        </ContextMenuItem>
                        <ContextMenuSeparator className="bg-zinc-700" />
                        <ContextMenuSub>
                          <ContextMenuSubTrigger className="hover:bg-zinc-700">
                            Add to Playlist
                          </ContextMenuSubTrigger>
                          <ContextMenuSubContent className="w-48 bg-zinc-800 border-zinc-700 text-white">
                            <ScrollArea className="max-h-48">
                              {playlists.length > 0 ? (
                                playlists.map((playlist) => (
                                  <ContextMenuItem
                                    key={playlist._id}
                                    className="hover:bg-zinc-700 truncate"
                                  >
                                    {playlist.title}
                                  </ContextMenuItem>
                                ))
                              ) : (
                                <ContextMenuItem disabled>
                                  No playlists available
                                </ContextMenuItem>
                              )}
                              <ContextMenuSeparator className="bg-zinc-700" />
                              <ContextMenuItem className="hover:bg-zinc-700 flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Create New Playlist
                              </ContextMenuItem>
                            </ScrollArea>
                          </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator className="bg-zinc-700" />
                        <ContextMenuItem className="hover:bg-zinc-700">
                          Share
                        </ContextMenuItem>
                        <ContextMenuItem className="hover:bg-zinc-700">
                          View Album Details
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
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
                {isOpen ? "Show Less" : "Show More"} ({remainingAlbums.length}{" "}
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

export default SectionAlbumGrid;
