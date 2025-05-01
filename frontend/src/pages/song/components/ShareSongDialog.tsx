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
import { Share2, Copy, Twitter, Facebook, MessageCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

interface ShareSongDialogProps {
  songId: string;
  songTitle: string;
}

const ShareSongDialog = ({ songId, songTitle }: ShareSongDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const shareUrl = `https://melodia.com/songs/${songId}`; // Thay bằng URL thực tế sau
  const shareText = `Check out "${songTitle}" on YourApp! ${shareUrl}`;

  // Xử lý sao chép liên kết
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link.");
      console.error("Error copying link:", error);
    }
  };

  // Chia sẻ lên Twitter/X
  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  // Chia sẻ lên Facebook
  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`Listen to "${songTitle}" on YourApp!`)}`;
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
  };

  // Chia sẻ lên WhatsApp
  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full p-3 border-zinc-600 hover:bg-zinc-700 transition-all duration-200"
        >
          <Share2 className="h-5 w-5" />
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
            <DialogContent className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/70 rounded-xl max-w-md w-full shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white font-outfit">
                  Share "{songTitle}"
                </DialogTitle>
                <DialogDescription className="text-zinc-300">
                  Share this song with your friends!
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Share Link */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Share Link
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-400 rounded-md focus:ring-0 cursor-default"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="rounded-full border-zinc-600 hover:bg-zinc-700 text-white transition-all duration-200 shadow-md"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Social Sharing Options */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-4"
                >
                  <Label className="text-sm font-medium text-zinc-200 font-outfit">
                    Share to Social Media
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleShareTwitter}
                      className="bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                    >
                      <Twitter className="h-4 w-4" />
                      Share on X
                    </Button>
                    <Button
                      onClick={handleShareFacebook}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                    >
                      <Facebook className="h-4 w-4" />
                      Share on Facebook
                    </Button>
                    <Button
                      onClick={handleShareWhatsApp}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-md transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Share on WhatsApp
                    </Button>
                    {/* Có thể thêm các nền tảng khác ở đây */}
                  </div>
                </motion.div>
              </div>

              <DialogFooter>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="border-t border-zinc-700/50 pt-4 flex justify-end w-full"
                >
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-md bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500 transition-all duration-200 shadow-md"
                  >
                    Close
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

export default ShareSongDialog;