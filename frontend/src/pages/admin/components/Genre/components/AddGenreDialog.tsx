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
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddGenreDialog = () => {
  const { addGenre } = useMusicStore();
  const [artistData, setArtistData] = useState({
    name: "",
    description: "",
  });

  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      if (validateImageFile(imageFile)) {
        setFiles((prev) => ({ ...prev, image: imageFile }));
      }
    }
  };

  const resetFileInput = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (file && validateImageFile(file)) {
      setFiles((prev) => ({ ...prev, image: file }));
      resetFileInput(); // Reset sau khi đặt file
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!artistData.name.trim()) {
      toast.error("Artist name is required");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", artistData.name);
      if (artistData.description) {
        formData.append("description", artistData.description);
      } else {
        formData.append(
          "description",
          ""
        );
      }

      if (files.image) {
        formData.append("imageFile", files.image);
      } else {
        // toast.error("Please upload an image for the artist.");
        // setIsLoading(false);
        // return;
        // Fetch ảnh mặc định từ public/artist.jpeg
        const defaultImagePath = `/genre.jpeg`;
        const response = await fetch(defaultImagePath);
        const blob = await response.blob();

        formData.append(
          "imageFile",
          new File([blob], "genre.jpeg", { type: blob.type })
        );
      }

      await addGenre(formData);

      setArtistData({ name: "", description: "" });
      setFiles({ image: null });
      setSongDialogOpen(false);
      // toast.success("Artist created successfully!");
    } catch (error) {
      console.error("Error creating artist:", error);
      toast.error("Failed to create artist. Please try again.");
    } finally {
      setIsLoading(false);
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
  return (
    <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Add Genre
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Add New Genre</DialogTitle>
              <DialogDescription>
                Add a new genre to your collection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </div>
    
            {/* Image upload area */}
            <div
              className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer ${
                isDragOverImage ? "border-green-500 bg-blue-50" : "border-zinc-700"
              } ${!files.image && "border-yellow-500 bg-red-50"}`} // Đổi màu khi file không hợp lệ
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
                    <Button variant="outline" size="sm" className="text-xs">
                      Choose File
                    </Button>
                  </div>
                )}
                {!files.image && (
                  <div className="text-zinc-400 mb-2">
                    Drag and drop or click to upload artwork (JPEG, PNG only)
                  </div>
                )}
              </div>
            </div>
    
            <div className="space-y-2">
              <label className="text-sm font-medium">Name*</label>
              <Input
                value={artistData.name}
                onChange={(e) =>
                  setArtistData({ ...artistData, name: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
    
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Description</label>
              <Input
                type="textarea"
                placeholder=""
                value={artistData.description}
                onChange={(e) =>
                  setArtistData({ ...artistData, description: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
    
            <DialogFooter>
              <Button
                variant={"outline"}
                onClick={() => setSongDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}

export default AddGenreDialog