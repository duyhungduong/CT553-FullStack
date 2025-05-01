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
import { Song } from "@/types";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ShowDetailSong = ({ song }: { song: Song }) => {
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSong, setEditedSong] = useState<Song>(song);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log("Saving edited song:", editedSong);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSong(song);
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Song
  ) => {
    setEditedSong({ ...editedSong, [field]: e.target.value });
  };

  return (
    <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
      <DialogTrigger asChild>
        <span className="font-medium cursor-pointer text-emerald-400 hover:text-emerald-600 transition-colors duration-200">
          {song.title}
        </span>
      </DialogTrigger>
      <AnimatePresence>
        {songDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-xl max-w-7xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white">
                  {song.title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Explore and edit the details of {song.title}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Section - Image */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-full max-w-lg h-96 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
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
                      value={editedSong.title}
                      onChange={(e) => handleInputChange(e, "title")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Artists
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={
                        editedSong.artists?.length > 0
                          ? editedSong.artists.map((a) => a.name).join(", ")
                          : "Unknown Artist"
                      }
                      onChange={(e) =>
                        setEditedSong({
                          ...editedSong,
                          artists: e.target.value
                            ? e.target.value
                                .split(",")
                                .map((name) => ({ _id: "", name: name.trim() }))
                            : [],
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Genres
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={
                        editedSong.genres?.length > 0
                          ? editedSong.genres.map((g) => g.name).join(", ")
                          : "No genres"
                      }
                      onChange={(e) =>
                        setEditedSong({
                          ...editedSong,
                          genres: e.target.value
                            ? e.target.value
                                .split(",")
                                .map((name) => ({ _id: "", name: name.trim() }))
                            : [],
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Instruments
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={
                        editedSong.instruments?.length > 0
                          ? editedSong.instruments.map((i) => i.name).join(", ")
                          : "No instruments"
                      }
                      onChange={(e) =>
                        setEditedSong({
                          ...editedSong,
                          instruments: e.target.value
                            ? e.target.value
                                .split(",")
                                .map((name) => ({ _id: "", name: name.trim() }))
                            : [],
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Streams
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedSong.streams?.toLocaleString() || "0"}
                      onChange={(e) =>
                        setEditedSong({
                          ...editedSong,
                          streams: Number(e.target.value.replace(/[^0-9]/g, "")),
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Likes
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedSong.likes?.toLocaleString() || "0"}
                      onChange={(e) =>
                        setEditedSong({
                          ...editedSong,
                          likes: Number(e.target.value.replace(/[^0-9]/g, "")),
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Release Date
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedSong.createdAt?.split("T")[0] || "Unknown"}
                      onChange={(e) => handleInputChange(e, "createdAt")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>
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
                      onClick={() => setSongDialogOpen(false)}
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

export default ShowDetailSong;