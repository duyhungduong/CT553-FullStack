import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { Plus, Upload } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

interface AddSongToPlaylistDialogProps {
  songId: string;
}

const AddSongToPlaylistDialog = ({ songId }: AddSongToPlaylistDialogProps) => {
  const { playlists, fetchPlaylists, addPlaylist, addTrackToPlaylist } =
    useMusicStore();
  const { info } = useChatStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [playlistData, setPlaylistData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [files, setFiles] = useState<{ image: File | null }>({ image: null });
  const [isLoading, setIsLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch playlists khi mở dialog
  const handleOpen = () => {
    if (info?._id) {
      fetchPlaylists(1, 100);
    }
    setDialogOpen(true);
  };

  // Kiểm tra bài hát đã có trong playlist chưa
  const isSongInPlaylist = (playlistId: string): boolean => {
    const playlist = playlists.find((p) => p._id === playlistId);
    return playlist?.tracks?.some((track) => track._id === songId) || false;
  };

  // Xử lý thêm bài hát vào playlist
  const handleAddToPlaylist = async (playlistId: string) => {
    if (!info?._id) {
      toast.error("Please log in to add songs to playlists");
      return;
    }

    setLocalLoading((prev) => ({ ...prev, [playlistId]: true }));
    try {
      await addTrackToPlaylist(playlistId, songId);
    //   toast.success("Song added to playlist!");
    } catch (error) {
      toast.error(`Failed to add song to playlist: ${error}`);
    } finally {
      setLocalLoading((prev) => ({ ...prev, [playlistId]: false }));
    }
  };

  // Xử lý kéo thả hình ảnh
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

  // Xác thực file hình ảnh
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

  // Xử lý tạo playlist mới
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
        // toast.success(`Playlist created and song added!`);
      } else {
        // toast.success("Playlist created successfully!");
      }

      setPlaylistData({ title: "", description: "", isPublic: true });
      setFiles({ image: null });
      setIsCreating(false);
      fetchPlaylists(1, 100);
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
          size="icon"
          className="rounded-full p-3 border-zinc-600 hover:bg-zinc-700 transition-all duration-200"
          onClick={handleOpen}
        >
          <Plus className="h-5 w-5" />
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
            <DialogContent className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/70 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white font-outfit">
                  {isCreating ? "Create New Playlist" : "Add to Playlist"}
                </DialogTitle>
                <DialogDescription className="text-zinc-300">
                  {isCreating
                    ? "Craft a new playlist for your music collection"
                    : "Choose a playlist or create a new one"}
                </DialogDescription>
              </DialogHeader>

              {isCreating ? (
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
                        <p className="text-sm">
                          Drag or click to upload artwork
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          JPEG/PNG, max 50MB
                        </p>
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
                        setPlaylistData({
                          ...playlistData,
                          title: e.target.value,
                        })
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
                        setPlaylistData({
                          ...playlistData,
                          description: e.target.value,
                        })
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
              ) : (
                <div className="p-1">
                  <ScrollArea className="h-[70vh] px-5">
                    <AnimatePresence>
                      {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                          <motion.div
                            key={playlist._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4"
                          >
                            <Card className="bg-zinc-800/70 border-zinc-700 hover:bg-zinc-700/90 transition-all duration-300 shadow-md rounded-lg overflow-hidden">
                              <CardContent className="p-4 flex items-center gap-4">
                                {/* Playlist Image */}
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={
                                      playlist.imageUrl ||
                                      "/default-playlist.jpeg"
                                    }
                                    alt={playlist.title}
                                    className="w-32 h-32 rounded-md object-cover shadow-md transition-transform duration-300 hover:scale-105"
                                  />
                                  {playlist.isPublic && (
                                    <span className="absolute top-1 right-1 bg-green-500 text-white text-xs font-semibold px-1 rounded-full">
                                      Public
                                    </span>
                                  )}
                                </div>

                                {/* Playlist Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white truncate">
                                      {playlist.title}
                                    </h3>
                                    <Button
                                      size="lg"
                                      variant="outline"
                                      onClick={() =>
                                        handleAddToPlaylist(playlist._id)
                                      }
                                      disabled={
                                        isSongInPlaylist(playlist._id) ||
                                        localLoading[playlist._id]
                                      }
                                      className={`rounded-full border-zinc-600 hover:bg-sky-500 hover:text-white transition-all duration-200 ${
                                        isSongInPlaylist(playlist._id)
                                          ? "text-zinc-400 cursor-not-allowed"
                                          : "text-white"
                                      }`}
                                    >
                                      {localLoading[playlist._id] ? (
                                        "Adding..."
                                      ) : isSongInPlaylist(playlist._id) ? (
                                        "Added"
                                      ) : (
                                        <Plus className="h-10 w-10" />
                                      )}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-zinc-400 line-clamp-1">
                                    {playlist.description || "No description"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                    <span>
                                      {playlist.total_tracks || 0} tracks
                                    </span>
                                    <span>•</span>
                                    <span>by {playlist.user.name}</span>
                                    {playlist.artist && (
                                      <>
                                        <span>•</span>
                                        <span>{playlist.artist.name}</span>
                                      </>
                                    )}
                                  </div>
                                  {playlist.genres?.length > 0 && (
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                      {playlist.genres
                                        .slice(0, 2)
                                        .map((genre) => (
                                          <span
                                            key={genre._id}
                                            className="text-xs bg-zinc-700 text-zinc-200 px-1 rounded"
                                          >
                                            #{genre.name}
                                          </span>
                                        ))}
                                      {playlist.genres.length > 2 && (
                                        <span className="text-xs text-zinc-400">
                                          +{playlist.genres.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="text-zinc-400 text-center py-4"
                        >
                          No playlists available. Create one below!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </div>
              )}

              {/* Footer */}
              <DialogFooter>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="border-t border-zinc-700/50 pt-4 flex justify-between w-full"
                >
                  {isCreating ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreating(false)}
                        className="rounded-md bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500 transition-all duration-200 shadow-md"
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <div className="flex gap-3">
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
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="rounded-md bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500 transition-all duration-200 shadow-md"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setIsCreating(true)}
                        className="rounded-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create New
                      </Button>
                    </>
                  )}
                </motion.div>
              </DialogFooter>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default AddSongToPlaylistDialog;
