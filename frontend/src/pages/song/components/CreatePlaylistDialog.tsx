import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePlaylistDialogProps {
  songId?: string; // Optional: songId để thêm bài hát ngay sau khi tạo playlist
}

const CreatePlaylistDialog = ({ songId }: CreatePlaylistDialogProps) => {
  const { addPlaylist, addTrackToPlaylist } = useMusicStore();
  const { info } = useChatStore();
  const [playlistData, setPlaylistData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [files, setFiles] = useState<{ image: File | null }>({ image: null });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDragOverImage, setIsDragOverImage] = useState(false);

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImage(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const imageFile = droppedFiles[0];
      if (validateImageFile(imageFile)) {
        setFiles((prev) => ({ ...prev, image: imageFile }));
      }
    }
  };

  const validateImageFile = (file: File) => {
    const allowedImageTypes = ["image/jpeg", "image/png"];
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Only JPEG and PNG files are allowed.");
      return false;
    }
    if (file.size > maxFileSize) {
      toast.error("File size exceeds 50MB limit.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!playlistData.title.trim()) {
      toast.error("Playlist title is required");
      return;
    }
    if (!info?._id) {
      toast.error("User authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", playlistData.title);
      formData.append("description", playlistData.description || "");
      formData.append("isPublic", String(playlistData.isPublic));
      formData.append("userId", info._id);

      if (files.image) {
        formData.append("imageFile", files.image);
      } else {
        const defaultImagePath = `/default-playlist.jpeg`;
        const response = await fetch(defaultImagePath);
        const blob = await response.blob();
        formData.append(
          "imageFile",
          new File([blob], "default-playlist.jpeg", { type: blob.type })
        );
      }

      const newPlaylist = await addPlaylist(formData);

      if (songId && newPlaylist._id) {
        await addTrackToPlaylist(newPlaylist._id, songId);
        toast.success(`Playlist created and song added!`);
      } else {
        toast.success("Playlist created successfully!");
      }

      setPlaylistData({ title: "", description: "", isPublic: true });
      setFiles({ image: null });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-zinc-600 text-white hover:bg-zinc-700/50 hover:border-zinc-500 transition-all duration-200 shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Playlist
        </Button>
      </DialogTrigger>
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <DialogContent className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/70 rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white font-outfit">
                  Create New Playlist
                </DialogTitle>
                <DialogDescription className="text-zinc-300">
                  Craft a new playlist for your music collection
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Image Upload Area */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={`relative flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    isDragOverImage
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-zinc-600/50 hover:border-zinc-500"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverImage(true);
                  }}
                  onDragLeave={() => setIsDragOverImage(false)}
                  onDrop={handleDropImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files![0];
                      if (file && validateImageFile(file)) {
                        setFiles((prev) => ({ ...prev, image: file }));
                      }
                    }}
                  />
                  {files.image ? (
                    <img
                      src={URL.createObjectURL(files.image)}
                      alt="Uploaded preview"
                      className="w-32 h-32 object-cover rounded-md shadow-lg transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="text-center text-zinc-400">
                      <Upload className="h-8 w-8 mx-auto mb-3" />
                      <p className="text-sm">Drag or click to upload artwork</p>
                      <p className="text-xs text-zinc-500 mt-1">JPEG/PNG, max 50MB</p>
                    </div>
                  )}
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Title
                  </Label>
                  <Input
                    placeholder="Enter playlist title"
                    value={playlistData.title}
                    onChange={(e) =>
                      setPlaylistData({ ...playlistData, title: e.target.value })
                    }
                    className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 rounded-md"
                  />
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Enter playlist description"
                    value={playlistData.description}
                    onChange={(e) =>
                      setPlaylistData({ ...playlistData, description: e.target.value })
                    }
                    className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 rounded-md resize-none h-24"
                  />
                </motion.div>

                {/* Public Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Public Playlist
                  </Label>
                  <Switch
                    checked={playlistData.isPublic}
                    onCheckedChange={(checked) =>
                      setPlaylistData({ ...playlistData, isPublic: checked })
                    }
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-600 transition-colors duration-200"
                  />
                </motion.div>
              </div>

              {/* Footer */}
              <DialogFooter>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="border-t border-zinc-700/50 pt-4 flex justify-end gap-3 w-full"
                >
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-md bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500 transition-all duration-200 shadow-md"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="rounded-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h-8z"
                          />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </motion.div>
              </DialogFooter>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default CreatePlaylistDialog;