import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Album } from "@/types";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { formatDuration } from "@/utils/formatDuration";
import { motion, AnimatePresence } from "framer-motion";

const ShowDetailAlbum = ({ album }: { album: Album }) => {
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAlbum, setEditedAlbum] = useState<Album>(album);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log("Saving edited album:", editedAlbum);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedAlbum(album);
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Album
  ) => {
    setEditedAlbum({ ...editedAlbum, [field]: e.target.value });
  };

  return (
    <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
      <DialogTrigger asChild>
        <span className="font-medium cursor-pointer text-indigo-400 hover:text-indigo-600 transition-colors duration-200">
          {album.title}
        </span>
      </DialogTrigger>
      <AnimatePresence>
        {albumDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white">
                  {album.title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Explore and edit the details of {album.title}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Section - Image */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <img
                      src={album.imageUrl}
                      alt={album.title}
                      className="w-full max-w-md h-96 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </div>
                </div>

                {/* Right Section - Details */}
                <div className="space-y-6 overflow-y-auto max-h-[60vh]">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Title
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedAlbum.title}
                      onChange={(e) => handleInputChange(e, "title")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Artist
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedAlbum.artist?.name || "Unknown"}
                      onChange={(e) =>
                        setEditedAlbum({
                          ...editedAlbum,
                          artist: { ...editedAlbum.artist, name: e.target.value },
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Release Year
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedAlbum.releaseYear || "Unknown"}
                      onChange={(e) =>
                        handleInputChange(e, "releaseYear" as keyof Album)
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Total Tracks
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedAlbum.total_tracks || 0}
                      onChange={(e) =>
                        handleInputChange(e, "total_tracks" as keyof Album)
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Total Duration
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={formatDuration(editedAlbum.total_duration) || "0:00"}
                      onChange={(e) =>
                        handleInputChange(e, "total_duration" as keyof Album)
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-300">
                      Description
                    </Label>
                    <Textarea
                      disabled={!isEditing}
                      value={editedAlbum.description || "No description available"}
                      onChange={(e) => handleInputChange(e, "description")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white h-32 resize-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-300">
                      Genres
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedAlbum.genres?.map((g) => g.name).join(", ") || "No genres"}
                      onChange={(e) =>
                        setEditedAlbum({
                          ...editedAlbum,
                          genres: e.target.value
                            .split(",")
                            .map((name) => ({ _id: "", name: name.trim() })),
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  {album.tracks && album.tracks.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-300">
                        Tracks
                      </Label>
                      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                        <ul className="space-y-2 text-white">
                          {album.tracks.map((track, index) => (
                            <li key={track._id} className="flex items-center gap-2">
                              <span className="text-zinc-400">{index + 1}.</span>
                              <span>{track.title}</span>
                              <span className="text-zinc-400">
                                ({formatDuration(track.duration) || "0:00"})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-700/50 p-4 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700/50 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAlbumDialogOpen(false)}
                      className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700/50 transition-all duration-200"
                    >
                      Close
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ShowDetailAlbum;