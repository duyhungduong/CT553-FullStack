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
import { Artist } from "@/types"; // Giả định bạn có type Artist trong types
import { Check, X } from "lucide-react"; // Loại bỏ Calendar vì không cần thiết ở đây
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

const ShowDetailArtist = ({ artist }: { artist: Artist }) => {
  const [artistDialogOpen, setArtistDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedArtist, setEditedArtist] = useState<Artist>(artist);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Logic lưu artist đã chỉnh sửa (có thể gọi API tại đây)
    console.log("Saving edited artist:", editedArtist);
    setIsEditing(false);
    // Cập nhật artist gốc nếu cần: artist = editedArtist (thường cần thông qua store hoặc API)
  };

  const handleCancel = () => {
    setEditedArtist(artist); // Khôi phục dữ liệu gốc
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Artist
  ) => {
    setEditedArtist({ ...editedArtist, [field]: e.target.value });
  };

  return (
    <Dialog open={artistDialogOpen} onOpenChange={setArtistDialogOpen}>
      <DialogTrigger asChild>
        <span className="font-medium cursor-pointer text-orange-400 hover:text-orange-600 transition-colors duration-200">
          {artist.name}
        </span>
      </DialogTrigger>
      <AnimatePresence>
        {artistDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white">
                  {artist.name}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Explore and edit the details of {artist.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Section - Image */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full max-w-lg h-96 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </div>
                </div>

                {/* Right Section - Details */}
                <div className="space-y-6 overflow-y-auto max-h-[60vh]">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Name
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedArtist.name}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Country
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedArtist.country || "Unknown"}
                      onChange={(e) => handleInputChange(e, "country")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Created At
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={
                        editedArtist.createdAt
                          ? editedArtist.createdAt.split("T")[0]
                          : "Unknown"
                      }
                      onChange={(e) => handleInputChange(e, "createdAt")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-300">
                      Bio
                    </Label>
                    <Textarea
                      disabled={!isEditing}
                      value={editedArtist.bio || "No bio available"}
                      onChange={(e) => handleInputChange(e, "bio")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white h-32 resize-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
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
                      onClick={() => setArtistDialogOpen(false)}
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

export default ShowDetailArtist;