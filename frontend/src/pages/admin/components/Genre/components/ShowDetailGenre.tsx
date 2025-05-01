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
import { Genre } from "@/types"; // Giả định bạn có type Genre trong types
import { Check, X } from "lucide-react"; // Thêm icon Check và X
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

const ShowDetailGenre = ({ genre }: { genre: Genre }) => {
  const [genreDialogOpen, setGenreDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGenre, setEditedGenre] = useState<Genre>(genre);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Logic lưu genre đã chỉnh sửa (có thể gọi API tại đây)
    console.log("Saving edited genre:", editedGenre);
    setIsEditing(false);
    // Cập nhật genre gốc nếu cần: genre = editedGenre (thường cần thông qua store hoặc API)
  };

  const handleCancel = () => {
    setEditedGenre(genre); // Khôi phục dữ liệu gốc
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Genre
  ) => {
    setEditedGenre({ ...editedGenre, [field]: e.target.value });
  };

  return (
    <Dialog open={genreDialogOpen} onOpenChange={setGenreDialogOpen}>
      <DialogTrigger asChild>
        <span className="font-medium cursor-pointer text-rose-400 hover:text-rose-600 transition-colors duration-200">
          {genre.name}
        </span>
      </DialogTrigger>
      <AnimatePresence>
        {genreDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white">
                  {genre.name}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Explore and edit the details of {genre.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Section - Image */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <img
                      src={genre.imageUrl}
                      alt={genre.name}
                      className="w-full max-w-sm h-auto object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
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
                      value={editedGenre.name}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-300">
                      Description
                    </Label>
                    <Textarea
                      disabled={!isEditing}
                      value={editedGenre.description || "No description available"}
                      onChange={(e) => handleInputChange(e, "description")}
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
                      onClick={() => setGenreDialogOpen(false)}
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

export default ShowDetailGenre;