import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import { MessageCircleMore, Plus, Search} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@/types";
// import { User } from "@/types";

const CreateConversationDialog = () => {
  const { friends, setSelectedUser, onlineUsers } = useChatStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const handleChatWithFriend = async (friend: User) => {
    setSelectedUser(friend); // Đặt user được chọn
    // await fetchConversation(friend.clerkId); // Fetch hoặc tạo conversation
    setOpen(false); // Đóng dialog sau khi tạo
    navigate("/message");
  };

  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="text-zinc-300 hover:text-emerald-400 border-zinc-700 bg-zinc-800/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 shadow-xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-lg font-semibold text-white tracking-tight">
            Start a New Vibe
          </DialogTitle>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-20 pointer-events-none" />
        </DialogHeader>
        <div className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </motion.div>
          <ScrollArea className="max-h-[300px] mt-4">
            {filteredFriends.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-zinc-400 text-center py-4"
              >
                No friends found <Link to="/friendsactivity" className="text-emerald-400 hover:text-emerald-700 hover:underline"> Find friends</Link>
              </motion.p>
            ) : (
              <div className="space-y-2 p-2">
                <AnimatePresence>
                  {filteredFriends.map((friend) => {
                    const isOnline = onlineUsers.has(friend.clerkId);
                    return (
                      <motion.div
                        key={friend.clerkId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleChatWithFriend(friend)}
                        className="group relative overflow-hidden rounded-md bg-zinc-800/50 p-2 hover:bg-zinc-800 transition-all duration-200 border border-zinc-700 hover:border-emerald-500/50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between" >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="size-9 border-2 border-zinc-800/50 transition-all group-hover:border-emerald-500/50">
                                <AvatarImage src={friend.imageUrl} alt={friend.fullName} />
                                <AvatarFallback className="bg-zinc-800 text-emerald-400">
                                  {friend.fullName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <motion.div
                                animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-black ${
                                  isOnline ? "bg-emerald-400" : "bg-zinc-600"
                                }`}
                              />
                            </div>
                            <span className="text-sm font-medium text-white truncate">
                              {friend.fullName}
                            </span>
                          </div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                            //   onClick={() => handleChatWithFriend(friend)}
                              className="text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/50"
                            >
                              <MessageCircleMore className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateConversationDialog;