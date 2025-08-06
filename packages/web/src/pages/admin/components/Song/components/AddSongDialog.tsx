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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMusicStore } from "@/stores/useMusicStore";
import { Check, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import AddArtistSheet from "../../Artist/components/AddArtistSheet";
import { parseBlob } from "music-metadata";
import "../../../../../App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
// import { Essentia, EssentiaWASM } from "essentia.js";

interface NewSong {
  title: string; // Tên bài hát
  artist: string; // Tên nghệ sĩ
  genre: string[]; // Mảng các thể loại bài hát
  releaseYear: string; // Năm phát hành (1900 đến năm hiện tại)
  duration: string; // Thời lượng bài hát (tính bằng giây)
  albumId: string; // ID album chứa bài hát (có thể không có)
  instrument: string[];
  mood: string; // Add mood
  tempo: string; // Add tempo (as string for form input, will be parsed to number)
  keySignature: string; // Add keySignature
  timeSignature: string; // Add timeSignature
}

const AddSongDialog = () => {
  const { albums, genres, instruments } = useMusicStore();
  const { addSong } = useMusicStore();
  const { artists, addArtist, addAlbum } = useMusicStore();
  const [progress, setProgress] = useState(0);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newSong, setNewSong] = useState<NewSong>({
    title: "",
    artist: "",
    genre: [],
    releaseYear: new Date().getFullYear().toString(),
    duration: "150",
    albumId: "",
    instrument: [],
    mood: "peaceful", // Default value
    tempo: "120", // Default value
    keySignature: "C", // Default value
    timeSignature: "4/4", // Default value
  });

  const [files, setFiles] = useState<{
    audio: File | null;
    image: File | null;
  }>({
    audio: null,
    image: null,
  });

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const [isDragOverAudio, setIsDragOverAudio] = useState(false);

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

  // Hàm chọn ngẫu nhiên n phần tử từ mảng
  const getRandomItems = (array: string[], count: number): string[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  };

  const aSelectRandomMetadata = () => {
    const randomGenres = getRandomItems(
      genres.map((g) => g._id),
      3
    );
    const randomInstruments = getRandomItems(
      instruments.map((i) => i._id),
      3
    );

    const moods = [
      "peaceful",
      "relaxing",
      "melancholic",
      "romantic",
      "uplifting",
      "energetic",
      "dramatic",
      "mysterious",
      "triumphant",
      "ethereal",
      "contemplative",
      "hopeful",
    ];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];

    const tempos = ["80", "100", "120", "140", "160"];
    const randomTempo = tempos[Math.floor(Math.random() * tempos.length)];

    const keys = ["C", "G", "D", "A", "E", "F", "Bb", "Eb"];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    const times = ["4/4", "3/4", "6/8", "2/2"];
    const randomTime = times[Math.floor(Math.random() * times.length)];

    setNewSong((prev) => ({
      ...prev,
      genre: randomGenres,
      instrument: randomInstruments,
      mood: randomMood,
      tempo: randomTempo,
      keySignature: randomKey,
      timeSignature: randomTime,
    }));
  };

  const readAudioMetadata = async (file: File) => {
    try {
      const metadata = await parseBlob(file);
      const contributingArtists = metadata.common.artist || "Artist Unknown";
      const contributingAlbum = metadata.common.album || "Unknown Album";
      const year =
        metadata.common.year?.toString() || new Date().getFullYear().toString();

      const tempo = metadata.common.bpm || 120;
      console.log("tempo", tempo);
      // Extract cover art
      const coverArtUrl = await extractCoverArt(file);

      // Handle Artist
      let artistId = "";
      const existingArtist = artists.find(
        (artist) =>
          artist.name.toLowerCase().trim() ===
          contributingArtists.toLowerCase().trim()
      );
      if (existingArtist) {
        artistId = existingArtist._id;
      } else {
        const defaultImagePath = `/artist.jpeg`;
        const formData = new FormData();
        formData.append("name", contributingArtists.trim());
        formData.append(
          "bio",
          "A passionate and creative artist, always bringing unique and emotional works."
        );

        if (!coverArtUrl) {
          const response = await fetch(defaultImagePath);
          const blob = await response.blob();
          formData.append(
            "imageFile",
            new File([blob], "artist.jpeg", { type: blob.type })
          );
        } else {
          formData.append("imageFile", coverArtUrl);
        }

        const newArtist = await addArtist(formData);
        artistId = newArtist._id;
      }
      setNewSong((prev) => ({
        ...prev,
        artist: artistId,
        tempo: tempo.toString(),
      }));

      // Handle Album
      let albumId = "";
      const existingAlbum = albums.find(
        (album) =>
          album.title.toLowerCase().trim() ===
          contributingAlbum.toLowerCase().trim()
      );
      if (existingAlbum) {
        albumId = existingAlbum._id;
      } else {
        const defaultImageAlbumPath = `/album.jpeg`;
        const formData = new FormData();
        formData.append("title", contributingAlbum.trim());
        formData.append("releaseYear", year);
        formData.append(
          "description",
          "A passionate and creative album with unique works."
        );

        if (!coverArtUrl) {
          const response = await fetch(defaultImageAlbumPath);
          const blob = await response.blob();
          formData.append(
            "imageFile",
            new File([blob], "album.jpeg", { type: blob.type })
          );
        } else {
          formData.append("imageFile", coverArtUrl);
        }

        const newAlbum = await addAlbum(formData);
        albumId = newAlbum._id;
      }
      setNewSong((prev) => ({ ...prev, albumId: albumId || "" }));

      return { contributingArtists, contributingAlbum, year };
    } catch (error) {
      console.error("Error reading metadata:", error);
      return { contributingArtists: "Artist Unknown", album: "Unknown Album" };
    }
  };

  const extractCoverArt = async (file: File) => {
    try {
      const metadata = await parseBlob(file);

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];

        const imageFile = new File([picture.data], "coverArt.jpg", {
          type: picture.format,
        });

        return imageFile;
      } else {
        console.log("Không tìm thấy ảnh bìa trong file");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi đọc metadata:", error);
      return null;
    }
  };

  const handleDropAudio = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAudio(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      // setProgress(0);
      const audioFile = droppedFiles[0];
      if (audioFile.type.startsWith("audio/")) {
        setFiles((prev) => ({ ...prev, audio: audioFile }));

        // Định nghĩa Promise với kiểu string
        const processAudio: Promise<string> = new Promise((resolve, reject) => {
          try {
            setProgress(10);
            extractAudioDuration(audioFile)
              .then((duration: string) => {
                const songTitle = extractFileName(audioFile.name).slice(0, 50);
                setNewSong((prev) => ({ ...prev, title: songTitle, duration }));
                setProgress(40);

                return extractCoverArt(audioFile);
              })
              .then((coverArtUrl) => {
                if (coverArtUrl) {
                  setFiles((prev) => ({ ...prev, image: coverArtUrl }));
                }
                setProgress(70);
                return readAudioMetadata(audioFile);
              })
              .then(() => {
                aSelectRandomMetadata();
                setProgress(100);
                resolve(
                  `Added song: ${extractFileName(audioFile.name).slice(0, 50)}`
                );
              })
              .catch((error) => {
                console.error("Error processing audio:", error);
                reject(new Error("Failed to process audio file."));
              });
          } catch (error) {
            console.error("Sync error processing audio:", error);
            reject(new Error("Failed to process audio file."));
          }
        });

        // Sử dụng toast.promise để hiển thị trạng thái
        toast.promise(
          processAudio,
          {
            loading: (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between">
                  <span className="text-zinc-200">
                    Processing audio file...
                  </span>
                  <span className="text-zinc-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-zinc-700" />
              </div>
            ),
            success: (message: string) => (
              <span className="text-green-400">Ready to {message}</span>
            ),
            error: (error) => (
              <span className="text-red-400">{error.message}</span>
            ),
          },
          {
            style: {
              minWidth: "300px",
              background: "rgba(24, 24, 27, 0.95)",
              border: "1px solid rgba(55, 65, 81, 0.5)",
              borderRadius: "8px",
              color: "#fff",
              padding: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            },
            success: {
              duration: 5000,
              icon: "👏",
            },
          }
        );
      } else {
        toast.error("Please upload a valid audio file!");
      }
    }
  };

  const extractAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.floor(audio.duration).toString();
        resolve(duration); // Trả về duration dưới dạng chuỗi
      });
      audio.addEventListener("error", () => {
        reject(new Error("Failed to load audio metadata"));
      });
    });
  };

  const extractFileName = (fileName: string) => {
    // Tìm đến dấu ")" và lấy nội dung giữa dấu "-" và ")"
    const doublePairMatch = fileName.match(/-(.*?\))/);
    if (doublePairMatch) {
      const result = doublePairMatch[1].trim();
      return result.split("[")[0].trim(); // Loại bỏ phần sau dấu "[" nếu có
    }

    // Tìm đến dấu "[" và lấy nội dung giữa dấu "-" và "["
    const singlePairMatch = fileName.match(/-(.*?)\[/);
    if (singlePairMatch) {
      return singlePairMatch[1].trim(); // Lấy phần giữa "-" và "["
    }

    // Loại bỏ phần sau dấu "[" nếu không có match nào trước đó
    const result = fileName.split("[")[0].trim();

    return result; // Trả về phần đã xử lý
  };

  const handleSubmit = async () => {
    // Validate fields before sending the form
    if (!newSong.title.trim()) return toast.error("Title is required");
    if (!newSong.artist.trim()) return toast.error("Artist is required");
    if (newSong.genre.length === 0)
      return toast.error("Select at least one genre");
    if (parseInt(newSong.releaseYear, 10) < 1900)
      return toast.error("Release year must be 1900 or later");
    if (!files.audio) return toast.error("Audio file is required");
    if (!files.image) return toast.error("Image file is required");

    setIsLoading(true);

    try {
      // Prepare FormData for submission
      const formData = new FormData();
      formData.append("title", newSong.title);
      formData.append("artist", newSong.artist);
      formData.append("genre", JSON.stringify(newSong.genre));
      formData.append("releaseYear", newSong.releaseYear);
      formData.append("duration", newSong.duration);
      if (newSong.instrument.length > 0) {
        formData.append("instrument", JSON.stringify(newSong.instrument));
      }
      if (newSong.albumId && newSong.albumId !== "none") {
        formData.append("albumId", newSong.albumId);
      }
      formData.append("mood", newSong.mood); // Add mood
      formData.append("tempo", newSong.tempo); // Add tempo
      formData.append("keySignature", newSong.keySignature); // Add keySignature
      formData.append("timeSignature", newSong.timeSignature); // Add timeSignature

      formData.append("audioFile", files.audio);
      formData.append("imageFile", files.image);

      // Submit form data using the store's method
      await addSong(formData);

      // Reset state after success
      setNewSong({
        title: "",
        artist: "",
        genre: [],
        releaseYear: new Date().getFullYear().toString(),
        duration: "150",
        albumId: "",
        instrument: [],
        mood: "peaceful", // Default value
        tempo: "120", // Default value
        keySignature: "C", // Default value
        timeSignature: "4/4", // Default value
      });
      setFiles({
        audio: null,
        image: null,
      });
      setProgress(10);
      setSongDialogOpen(false);
    } catch (error) {
      console.error("Error adding song", error);
      toast.error("Failed to add song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewSong({
      title: "",
      artist: "",
      genre: [],
      releaseYear: new Date().getFullYear().toString(),
      duration: "150",
      albumId: "",
      instrument: [],
      mood: "peaceful", // Default value
      tempo: "120", // Default value
      keySignature: "C", // Default value
      timeSignature: "4/4", // Default value
    });
    setFiles({
      audio: null,
      image: null,
    });
    setProgress(10);
    setSongDialogOpen(false);
  };

  return (
    <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-md bg-emerald-500 hover:bg-emerald-600 text-black shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Add Song
        </Button>
      </DialogTrigger>
      <AnimatePresence>
        {songDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <DialogContent className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/70 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4 px-6">
                <DialogTitle className="text-2xl font-bold text-white font-outfit">
                  Add New Song
                </DialogTitle>
                <DialogDescription className="text-zinc-300">
                  Upload and configure your new song
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Section - Image & Audio Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-6 items-center justify-center">
                    <div
                      className={`relative w-full max-w-lg h-64 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
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
                        onChange={(e) =>
                          setFiles((prev) => ({
                            ...prev,
                            image: e.target.files![0],
                          }))
                        }
                      />
                      {files.image ? (
                        <>
                          <img
                            src={URL.createObjectURL(files.image)}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md shadow-lg"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-zinc-800/80 text-white hover:bg-zinc-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles((prev) => ({ ...prev, image: null }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-center text-zinc-400">
                          <Upload className="h-8 w-8 mx-auto mb-3" />
                          <p className="text-sm">
                            Drag or click to upload artwork
                          </p>
                        </div>
                      )}
                    </div>

                    <div
                      className={`relative w-full max-w-lg h-36 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        isDragOverAudio
                          ? "border-sky-500 bg-sky-500/10"
                          : "border-zinc-600/50 hover:border-zinc-500"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOverAudio(true);
                      }}
                      onDragLeave={() => setIsDragOverAudio(false)}
                      onDrop={handleDropAudio}
                      onClick={() => audioInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={audioInputRef}
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) =>
                          setFiles((prev) => ({
                            ...prev,
                            audio: e.target.files![0],
                          }))
                        }
                      />
                      <div className="text-center text-zinc-400 truncate px-4">
                        {files.audio ? (
                          <span className="text-white">
                            {extractFileName(files.audio.name).slice(0, 50)}
                          </span>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto mb-3" />
                            <p className="text-sm">
                              Drag or click to upload audio
                            </p>
                          </>
                        )}
                      </div>
                      {files.audio && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-zinc-800/80 text-white hover:bg-zinc-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles((prev) => ({ ...prev, audio: null }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {/* Right Section - Form Fields with ScrollArea */}
                  <ScrollArea className="h-[55vh] pr-4">
                    {" "}
                    {/* Thêm ScrollArea với chiều cao cố định */}
                    <div className="space-y-6 m-4">
                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Title
                        </Label>
                        <Input
                          value={newSong.title}
                          onChange={(e) =>
                            setNewSong({ ...newSong, title: e.target.value })
                          }
                          className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Artist
                        </Label>
                        <div className="flex w-full items-center gap-2">
                          <Select
                            value={newSong.artist}
                            onValueChange={(value) =>
                              setNewSong({ ...newSong, artist: value })
                            }
                          >
                            <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white w-full">
                              <SelectValue placeholder="Select an artist" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="none">No Artist</SelectItem>
                              {artists.map((artist) => (
                                <SelectItem key={artist._id} value={artist._id}>
                                  {artist.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AddArtistSheet />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Genre
                        </Label>
                        <ToggleGroup
                          type="multiple"
                          className="flex flex-wrap gap-2"
                          value={newSong.genre}
                          onValueChange={(value) =>
                            setNewSong({ ...newSong, genre: value })
                          }
                        >
                          {genres.map((genre) => (
                            <ToggleGroupItem
                              key={genre._id}
                              value={genre._id}
                              className="bg-zinc-800/70 border-zinc-700/50 text-white hover:bg-zinc-700 data-[state=on]:bg-sky-500 data-[state=on]:border-sky-500 rounded-md"
                            >
                              {genre.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Instruments
                        </Label>
                        <ToggleGroup
                          type="multiple"
                          className="flex flex-wrap gap-2"
                          value={newSong.instrument}
                          onValueChange={(value) =>
                            setNewSong({ ...newSong, instrument: value })
                          }
                        >
                          {instruments.map((instrument) => (
                            <ToggleGroupItem
                              key={instrument._id}
                              value={instrument._id}
                              className="bg-zinc-800/70 border-zinc-700/50 text-white hover:bg-zinc-700 data-[state=on]:bg-sky-500 data-[state=on]:border-sky-500 rounded-md"
                            >
                              {instrument.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Release Year
                        </Label>
                        <Input
                          type="number"
                          min="1900"
                          value={newSong.releaseYear}
                          onChange={(e) =>
                            setNewSong({
                              ...newSong,
                              releaseYear: e.target.value,
                            })
                          }
                          className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Duration
                        </Label>
                        <Input
                          type="number"
                          value={newSong.duration}
                          onChange={(e) =>
                            setNewSong({ ...newSong, duration: e.target.value })
                          }
                          className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Album
                        </Label>
                        <Select
                          value={newSong.albumId}
                          onValueChange={(value) =>
                            setNewSong({ ...newSong, albumId: value })
                          }
                        >
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white w-full">
                            <SelectValue placeholder="Select an album" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="none">No Album</SelectItem>
                            {albums.map((album) => (
                              <SelectItem key={album._id} value={album._id}>
                                {album.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Mood
                        </Label>
                        <Select
                          value={newSong.mood}
                          onValueChange={(value) =>
                            setNewSong({ ...newSong, mood: value })
                          }
                        >
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white w-full">
                            <SelectValue placeholder="Select mood" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {[
                              "peaceful",
                              "relaxing",
                              "melancholic",
                              "romantic",
                              "uplifting",
                              "energetic",
                              "dramatic",
                              "mysterious",
                              "triumphant",
                              "ethereal",
                              "contemplative",
                              "hopeful",
                            ].map((mood) => (
                              <SelectItem key={mood} value={mood}>
                                {mood}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Tempo
                        </Label>
                        <Input
                          type="number"
                          value={newSong.tempo}
                          onChange={(e) =>
                            setNewSong({ ...newSong, tempo: e.target.value })
                          }
                          className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Key
                        </Label>
                        <Select
                          value={newSong.keySignature}
                          onValueChange={(value) =>
                            setNewSong({ ...newSong, keySignature: value })
                          }
                        >
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white w-full">
                            <SelectValue placeholder="Select key" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {["C", "G", "D", "A", "E", "F", "Bb", "Eb"].map(
                              (key) => (
                                <SelectItem key={key} value={key}>
                                  {key}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                          Time
                        </Label>
                        <Select
                          value={newSong.timeSignature}
                          onValueChange={(value) =>
                            setNewSong({ ...newSong, timeSignature: value })
                          }
                        >
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {["4/4", "3/4", "6/8", "2/2"].map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
              </div>
              <DialogFooter>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="border-t border-zinc-700/50 pt-4 px-6 flex justify-end gap-3 w-full"
                >
                  <div className="border-t border-zinc-700/50 pt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700/50 transition-all duration-200"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSubmit}
                      className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4 mr-2" />{" "}
                      {isLoading ? "Uploading..." : "Add Song"}
                    </Button>
                  </div>
                </motion.div>
              </DialogFooter>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
export default AddSongDialog;
