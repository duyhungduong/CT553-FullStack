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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddInstrumentDialog = () => {
  const { addInstrument } = useMusicStore();
  const [artistData, setArtistData] = useState({
    name: "",
    description: "",
    family: "",
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
        formData.append("description", "");
      }
      formData.append("family", artistData.family);

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

      await addInstrument(formData);

      setArtistData({ name: "", description: "", family: "" });
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
        <Button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-red-50">
          <Plus className="mr-2 h-4 w-4" />
          Add Instrument
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add New Instrument</DialogTitle>
          <DialogDescription>
            Add a new instrument to your collection
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
          className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer ${
            isDragOverImage ? "border-green-500 bg-blue-50" : "border-zinc-700"
          } ${!files.image && "border-red-300 bg-red-50"}`} // Đổi màu khi file không hợp lệ
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
                <div className="p-1 bg-zinc-800 rounded-full inline-block mb-1">
                  <Upload className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="text-zinc-400 mb-2 text-xs">
                  Drag and drop or click to upload artwork
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Choose File
                </Button>
              </div>
            )}
            {!files.image && (
              <div className="text-zinc-700 mb-1 mt-1 text-xs font-light">
                Drag and drop or click to upload artwork (JPEG, PNG only)
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={artistData.name}
            onChange={(e) =>
              setArtistData({ ...artistData, name: e.target.value })
            }
            className="bg-zinc-800 border-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Genre</label>
          <ScrollArea className="h-20">
            <ToggleGroup
              type="single"
              className="grid grid-cols-4 gap-2"
              value={artistData.family}
              onValueChange={(selectedGenres) => {
                setArtistData({ ...artistData, family: selectedGenres });
              }}
            >
              {[
                "String",
                "Woodwind",
                "Brass",
                "Percussion",
                "Keyboard",
                "Electronic",
                "Other",
              ].map((genre) => (
                <ToggleGroupItem
                  key={genre}
                  value={genre}
                  className={`px-4 py-2 text-sm font-outfit font-light rounded border ${
                    artistData.family.includes(genre)
                      ? "bg-emerald-500 text-black"
                      : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {genre}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </ScrollArea>
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
  );
};

export default AddInstrumentDialog;
