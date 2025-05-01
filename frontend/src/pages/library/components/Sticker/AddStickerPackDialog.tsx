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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useStickerStore } from "@/stores/useStickerStore";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const AddStickerPackDialog = () => {
  const { createStickerPack, fetchStickers, stickers } = useStickerStore();
  const [packData, setPackData] = useState({
    name: "",
    description: "",
    is_premium: false,
    price: 0,
  });
  const [selectedStickerIds, setSelectedStickerIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch stickers khi mở dialog
  useEffect(() => {
    if (dialogOpen) {
      fetchStickers();
    }
  }, [dialogOpen, fetchStickers]);

  const handleStickerToggle = (stickerId: string) => {
    setSelectedStickerIds((prev) =>
      prev.includes(stickerId)
        ? prev.filter((id) => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const handleSubmit = async () => {
    if (!packData.name.trim()) {
      toast.error("Sticker pack name is required");
      return;
    }
    if (selectedStickerIds.length === 0) {
      toast.error("Please select at least one sticker");
      return;
    }
    if (packData.is_premium && (!packData.price || packData.price <= 0)) {
      toast.error("Premium packs must have a positive price");
      return;
    }

    setIsLoading(true);
    try {
      await createStickerPack({
        name: packData.name,
        description: packData.description,
        is_premium: packData.is_premium,
        price: packData.is_premium ? packData.price : 0,
        stickerIds: selectedStickerIds,
      });

      // Reset form sau khi tạo thành công
      setPackData({ name: "", description: "", is_premium: false, price: 0 });
      setSelectedStickerIds([]);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating sticker pack:", error);
      toast.error("Failed to create sticker pack. Please try again.");
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
          <Plus className="h-4 w-4 mr-2" /> Create New Sticker Pack
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
                  Create New Sticker Pack
                </DialogTitle>
                <DialogDescription className="text-zinc-300">
                  Build a new sticker pack for your collection
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Name
                  </Label>
                  <Input
                    placeholder="Enter sticker pack name"
                    value={packData.name}
                    onChange={(e) =>
                      setPackData({ ...packData, name: e.target.value })
                    }
                    className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 rounded-md"
                  />
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Description
                  </Label>
                  <Input
                    placeholder="Enter sticker pack description"
                    value={packData.description}
                    onChange={(e) =>
                      setPackData({ ...packData, description: e.target.value })
                    }
                    className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 rounded-md"
                  />
                </motion.div>

                {/* Premium Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Premium Pack
                  </Label>
                  <Switch
                    checked={packData.is_premium}
                    onCheckedChange={(checked) =>
                      setPackData({ ...packData, is_premium: checked })
                    }
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-600 transition-colors duration-200"
                  />
                </motion.div>

                {/* Price (hiển thị khi is_premium = true) */}
                {packData.is_premium && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-medium text-zinc-200 font-outfit">
                      Price
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={packData.price || ""}
                      onChange={(e) =>
                        setPackData({
                          ...packData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 rounded-md"
                    />
                  </motion.div>
                )}

                {/* Sticker Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Select Stickers
                  </Label>
                  <ScrollArea className="h-56 w-full rounded-md border border-zinc-700/50 bg-zinc-800/70 p-4">
                    {stickers.length > 0 ? (
                      stickers.map((sticker) => (
                        <div
                          key={sticker._id}
                          className="flex items-center space-x-2 py-2"
                        >
                          <Checkbox
                            checked={selectedStickerIds.includes(sticker._id)}
                            onCheckedChange={() => handleStickerToggle(sticker._id)}
                            className="border-zinc-600 data-[state=checked]:bg-green-500"
                          />
                          <img
                            src={sticker.image_url}
                            alt={sticker.name}
                            className="w-8 h-8 object-cover rounded-md"
                          />
                          <span className="text-white">{sticker.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400 text-sm">
                        No stickers available. Create some first!
                      </p>
                    )}
                  </ScrollArea>
                </motion.div>
              </div>

              {/* Footer */}
              <DialogFooter>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
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

export default AddStickerPackDialog;