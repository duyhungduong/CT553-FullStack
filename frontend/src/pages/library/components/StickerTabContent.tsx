import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStickerStore } from "@/stores/useStickerStore";
import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import AddStickerDialog from "./Sticker/AddStickerDialog";
import AddStickerPackDialog from "./Sticker/AddStickerPackDialog";
import EditStickerDialog from "./Sticker/EditStickerDialog";
import { StickerCategory, STICKER_CATEGORIES } from "@/types/sticker";
import { Pen, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StickerTabContent = () => {
  const {
    stickers,
    stickerPacks,
    stickersPagination,
    stickerPacksPagination,
    fetchStickers,
    fetchStickerPacks,
    deleteSticker,
  } = useStickerStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<StickerCategory | "all">("all");
  const [editStickerId, setEditStickerId] = useState<string | null>(null);
  const [deleteStickerId, setDeleteStickerId] = useState<string | null>(null); // State để mở AlertDialog

  useEffect(() => {
    fetchStickers({ page: 1, limit: 10 });
    fetchStickerPacks(1, 10);
  }, [fetchStickers, fetchStickerPacks]);

  const debouncedSearch = useCallback(
    debounce((
      // query: string
    ) => {
      fetchStickers({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        is_premium: undefined,
        page: 1,
        limit: stickersPagination.limit,
      });
    }, 300),
    [selectedCategory, fetchStickers, stickersPagination.limit]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const filteredStickers = stickers.filter((sticker) => {
    const matchesSearch = sticker.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory && selectedCategory !== "all"
        ? sticker.category === selectedCategory
        : true;
    return matchesSearch && matchesCategory;
  });

  const handleStickerPageChange = (newPage: number) => {
    fetchStickers({
      category: selectedCategory === "all" ? undefined : selectedCategory,
      is_premium: undefined,
      page: newPage,
      limit: stickersPagination.limit,
    });
  };

  const handleStickerPackPageChange = (newPage: number) => {
    fetchStickerPacks(newPage, stickerPacksPagination.limit);
  };

  const handleDeleteSticker = (id: string) => {
    setDeleteStickerId(id); // Mở AlertDialog
  };

  const confirmDeleteSticker = () => {
    if (deleteStickerId) {
      deleteSticker(deleteStickerId);
      setDeleteStickerId(null); // Đóng AlertDialog sau khi xác nhận
    }
  };

  const handleEditSticker = (id: string) => {
    setEditStickerId(id);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Input
          placeholder="Search stickers by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-400 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 rounded-md"
        />
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as StickerCategory | "all")}
        >
          <SelectTrigger className="w-full sm:w-48 bg-zinc-800/70 border-zinc-700/50 text-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
            <SelectGroup>
              <SelectItem value="all" className="hover:bg-zinc-700">
                All Categories
              </SelectItem>
              {STICKER_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category} className="hover:bg-zinc-700">
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <AddStickerDialog />
          <AddStickerPackDialog />
        </div>
      </motion.div>

      {/* Stickers Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-zinc-800/70 border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white font-outfit">
              Your Stickers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStickers.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {filteredStickers.map((sticker) => (
                      <motion.div
                        key={sticker._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center relative group"
                      >
                        <img
                          src={sticker.image_url}
                          alt={sticker.name}
                          className="w-24 h-24 object-cover rounded-md shadow-md hover:scale-105 transition-transform duration-200"
                        />
                        <p className="mt-2 text-sm text-white text-center truncate w-24">
                          {sticker.name}
                        </p>
                        {sticker.is_premium && (
                          <Badge className="mt-1 bg-yellow-500 text-black">Premium</Badge>
                        )}
                        <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-blue-500 text-white hover:bg-blue-600 h-6 w-6"
                            onClick={() => handleEditSticker(sticker._id)}
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-red-500 text-white hover:bg-red-600 h-6 w-6"
                                onClick={() => handleDeleteSticker(sticker._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-800 border-zinc-700 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the sticker "{sticker.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-zinc-700 text-white hover:bg-zinc-600">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDeleteSticker}
                                  className="bg-red-500 text-white hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-zinc-400">
                    Page {stickersPagination.page} of{" "}
                    {Math.ceil(stickersPagination.total / stickersPagination.limit) || 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStickerPageChange(stickersPagination.page - 1)}
                      disabled={stickersPagination.page <= 1}
                      variant="outline"
                      className="bg-zinc-700 text-white hover:bg-zinc-600"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handleStickerPageChange(stickersPagination.page + 1)}
                      disabled={
                        stickersPagination.page >=
                        Math.ceil(stickersPagination.total / stickersPagination.limit)
                      }
                      variant="outline"
                      className="bg-zinc-700 text-white hover:bg-zinc-600"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-center">No stickers found.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Sticker Packs Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-zinc-800/70 border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white font-outfit">
              Free Sticker Packs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(stickerPacks) && stickerPacks.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {stickerPacks.map((pack) => (
                      <motion.div
                        key={pack._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-zinc-700/50 p-4 rounded-md shadow-md hover:bg-zinc-700/70 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={pack.stickers?.[0]?.image_url || "/default-pack.png"}
                            alt={pack.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-white truncate">
                              {pack.name}
                            </h3>
                            <p className="text-sm text-zinc-400">
                              {pack.stickers?.length || 0} stickers
                            </p>
                            {pack.is_premium && (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-500 text-black">Premium</Badge>
                                <span className="text-sm text-white">${pack.price}</span>
                              </div>
                            )}
                            {pack.isOwned && (
                              <Badge className="bg-green-500">Owned</Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-zinc-400">
                    Page {stickerPacksPagination.page} of{" "}
                    {Math.ceil(stickerPacksPagination.total / stickerPacksPagination.limit) || 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStickerPackPageChange(stickerPacksPagination.page - 1)}
                      disabled={stickerPacksPagination.page <= 1}
                      variant="outline"
                      className="bg-zinc-700 text-white hover:bg-zinc-600"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handleStickerPackPageChange(stickerPacksPagination.page + 1)}
                      disabled={
                        stickerPacksPagination.page >=
                        Math.ceil(stickerPacksPagination.total / stickerPacksPagination.limit)
                      }
                      variant="outline"
                      className="bg-zinc-700 text-white hover:bg-zinc-600"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-center">No sticker packs found.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog chỉnh sửa sticker */}
      {editStickerId && (
        <EditStickerDialog
          stickerId={editStickerId}
          onClose={() => setEditStickerId(null)}
        />
      )}
    </div>
  );
};

export default StickerTabContent;