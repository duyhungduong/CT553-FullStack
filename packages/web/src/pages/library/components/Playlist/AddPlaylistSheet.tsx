import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AddPlaylistSheet = () => {
  const { addPlaylist } = useMusicStore();
  const { info } = useChatStore();
  const [playlistData, setPlaylistData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
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

      await addPlaylist(formData);
      toast.success("Playlist created successfully!");

      setPlaylistData({ title: "", description: "", isPublic: true });
      setFiles({ image: null });
      setSheetOpen(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700/50 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Playlist
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-zinc-900 text-white w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-white">Create Playlist</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Add a new playlist to your collection
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div
            className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              isDragOverImage ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700"
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
                className="w-24 h-24 object-cover rounded-md shadow-lg"
              />
            ) : (
              <div className="text-center text-zinc-400">
                <Upload className="h-6 w-6 mx-auto mb-2" />
                Drag or click to upload artwork
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-300">Title</Label>
            <Input
              placeholder="Enter playlist title"
              value={playlistData.title}
              onChange={(e) =>
                setPlaylistData({ ...playlistData, title: e.target.value })
              }
              className="bg-zinc-800/50 border-zinc-700/50 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-300">Description</Label>
            <Textarea
              placeholder="Enter playlist description"
              value={playlistData.description}
              onChange={(e) =>
                setPlaylistData({ ...playlistData, description: e.target.value })
              }
              className="bg-zinc-800/50 border-zinc-700/50 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium text-zinc-300">Public</Label>
            <Switch
              checked={playlistData.isPublic}
              onCheckedChange={(checked) =>
                setPlaylistData({ ...playlistData, isPublic: checked })
              }
            />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button
              variant="outline"
              className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700/50 transition-all duration-200"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddPlaylistSheet;