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
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label"
const AddArtistSheet = () => {
  const { addArtist } = useMusicStore();
  const [artistData, setArtistData] = useState({
    name: "",
    bio: "",
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
      if (artistData.bio) {
        formData.append("bio", artistData.bio);
      } else {
        formData.append(
          "bio",
          "A passionate and creative artist, always bringing unique and emotional works."
        );
      }

      if (files.image) {
        formData.append("imageFile", files.image);
      } else {
        // toast.error("Please upload an image for the artist.");
        // setIsLoading(false);
        // return;
        // Fetch ảnh mặc định từ public/artist.jpeg
        const defaultImagePath = `/artist.jpeg`;
        const response = await fetch(defaultImagePath);
        const blob = await response.blob();

        formData.append(
          "imageFile",
          new File([blob], "artist.jpeg", { type: blob.type })
        );
      }

      await addArtist(formData);

      setArtistData({ name: "", bio: "" });
      setFiles({ image: null });
      setSongDialogOpen(false);
      
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
    <Sheet open={songDialogOpen} onOpenChange={setSongDialogOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size={"icon"}>
          <Plus className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side={"top"}>
        <SheetHeader>
          <SheetTitle>Create Artist</SheetTitle>
          <SheetDescription>Add a new artist to the database</SheetDescription>
        </SheetHeader>

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
            isDragOverImage ? "border-blue-500 bg-blue-50" : "border-zinc-700"
          } ${!files.image && "border-red-500 bg-red-50"}`} // Đổi màu khi file không hợp lệ
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
          <Label className="text-sm font-medium">Name</Label>
          <Input
            placeholder="Enter artist name"
            value={artistData.name}
            onChange={(e) =>
              setArtistData({ ...artistData, name: e.target.value })
            }
            className="bg-zinc-800 border-zinc-700"
          />
        </div>

        <div className="space-y-2 mb-4">
          <Label className="text-sm font-medium">Bio</Label>
          <Textarea
            placeholder="Type your bio here."
            value={artistData.bio}
            onChange={(e) =>
              setArtistData({ ...artistData, bio: e.target.value })
            }
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddArtistSheet;
