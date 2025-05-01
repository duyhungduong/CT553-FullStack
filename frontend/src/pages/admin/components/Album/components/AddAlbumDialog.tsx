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
import { Input } from "@/components/ui/input";

import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import {  useRef, useState } from "react";
import toast from "react-hot-toast";


interface NewAlbum {
  title: string; // Tên của album
  releaseYear: string; // Năm phát hành
  // imageUrl: string; // URL của hình ảnh album
  description: string; // Mô tả của album (tùy chọn)
}

const AddAlbumDialog = () => {
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addAlbum } = useMusicStore();


  const [newAlbum, setNewAlbum] = useState<NewAlbum>({
    title: "",
    releaseYear: new Date().getFullYear().toString(),
    description: "",
  });

  const [files, setFiles] = useState<{
    image: File | null;
  }>({
    image: null,
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImage(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const imageFile = droppedFiles[0];
      if (imageFile.type.startsWith("image/")) {
        setFiles((prev) => ({ ...prev, image: imageFile }));
      } else {
        toast.error("Please upload a valid image file!");
      }
    }
  };

  const handleSubmit = async () => {
    if (!newAlbum.title.trim()) {
      return toast.error("Title is required");
    }
    if (!files.image) {
      return toast.error("Image is required");
    }

    setIsLoading(true);
    try {
      if (!files.image) {
        return toast.error("Please upload an image");
      }

      const formData = new FormData();
      formData.append("title", newAlbum.title);
      formData.append("releaseYear", newAlbum.releaseYear.toString());
      formData.append("description", newAlbum.description);
      formData.append("imageFile", files.image);

      await addAlbum(formData);

      setNewAlbum({
        title: "",
        releaseYear: new Date().getFullYear().toString(),
        description: "",
      });
      setFiles({
        image: null,
      });
      setAlbumDialogOpen(false);
      // toast.success("Album created successfully");
    } catch (error: any) {
      console.log("Error adding song", error);
      // toast.error("Failed to create album: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-500 hover:bg-violet-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Album
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add New Album</DialogTitle>
          <DialogDescription>
            Add a new album to your collection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              setFiles((prev) => ({ ...prev, image: e.target.files![0] }))
            }
          />

          {/* Image upload area */}
          <div
            className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer ${
              isDragOverImage ? "border-blue-500 bg-blue-50" : "border-zinc-700"
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
              onChange={(e) =>
                setFiles((prev) => ({ ...prev, image: e.target.files![0] }))
              }
            />
            <div className="text-center">
              {files.image ? (
                <div>
                  <img
                    src={URL.createObjectURL(files.image)}
                    alt="Uploaded preview"
                    className="w-24 h-24 object-cover rounded-md shadow-lg mx-auto"
                  />
                  <div className="text-sm text-zinc-400 mb-2">
                    {files.image
                      ? files.image.name.slice(0, 20)
                      : "Upload album artwork"}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="p-3 bg-zinc-800 rounded-full inline-block mb-2">
                    <Upload className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="text-zinc-400 mb-2">
                    Drag and drop or click to upload artwork
                  </div>
                  <Button variant="outline" size="sm" className="text-xs mt-2">
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Album Title</label>
            <Input
              value={newAlbum.title}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, title: e.target.value })
              }
              className="bg-zinc-800 border-zinc-700"
              placeholder="Enter album title"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Year</label>
            <Input
              type="number"
              value={newAlbum.releaseYear}
              onChange={(e) =>
                setNewAlbum({
                  ...newAlbum,
                  releaseYear: e.target.value || "1900",
                })
              }
              className="bg-zinc-800 border-zinc-700"
              placeholder="Enter release year"
              min={1900}
              max={new Date().getFullYear().toString()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={newAlbum.description}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, description: e.target.value })
              }
              className="bg-zinc-800 border-zinc-700"
              placeholder="Enter Description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setAlbumDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-violet-500 hover:bg-violet-600"
            disabled={
              isLoading || !files.image || !newAlbum.title
            }
          >
            {isLoading ? "Creating..." : "Add Album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumDialog;
