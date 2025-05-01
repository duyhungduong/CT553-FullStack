import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Badge } from "@/components/ui/badge";
import { AudioWaveform, Ellipsis, MessageCircle, Phone, User2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, onlineUsers, conversationId, userActivities } = useChatStore();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  if (!selectedUser || !conversationId) return null;

  const isOnline = onlineUsers.has(selectedUser.clerkId);
  const activity = userActivities.get(selectedUser.clerkId);
  const isPlaying = activity && activity !== "Idle";

  const handleOpenProfile = () => {
    setIsProfileDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-2 border-b border-zinc-700 bg-gradient-to-r from-zinc-800 via-zinc-900 to-black shadow-md"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Avatar và thông tin user */}
        <Dialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
        >
          <DialogTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleOpenProfile}>
              <div className="relative">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-zinc-700 transition-all hover:border-emerald-500/50">
                  <AvatarImage src={selectedUser.imageUrl} />
                  <AvatarFallback className="bg-zinc-800 text-emerald-400">
                    {selectedUser.fullName[0]}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black ${
                    isOnline ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0 truncate">
                <h2 className="text-lg font-semibold text-white truncate">
                  {selectedUser.fullName}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm ${
                      isOnline ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                  {isOnline && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/20 text-emerald-400 border-none"
                    >
                      Active
                    </Badge>
                  )}
                  {isPlaying && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/20 text-xs text-emerald-400 border-none truncate"
                      >
                        <AudioWaveform className="size-3 mr-1 animate-pulse" />
                        {activity.replace("Playing ", "")}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[65vw] max-h-[95vh] bg-zinc-900/90 border-none p-6 rounded-xl backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-6 w-full h-full"
            >
              {/* Avatar with Zoom */}
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                wheel={{ step: 0.1 }}
                doubleClick={{ mode: "toggle" }}
                centerOnInit={true}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent
                      wrapperStyle={{
                        width: "100%",
                        height: "60vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                      contentStyle={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Avatar className="h-80 w-80 border-2 border-emerald-500/50">
                        <AvatarImage src={selectedUser.imageUrl} />
                        <AvatarFallback className="bg-zinc-800 text-emerald-400 text-6xl">
                          {selectedUser.fullName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TransformComponent>
                    {/* Zoom Controls */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => zoomIn()}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200"
                      >
                        <ZoomIn className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => zoomOut()}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200"
                      >
                        <ZoomOut className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => resetTransform()}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </TransformWrapper>

              {/* User Info */}
              <div className="flex flex-col items-start gap-4 w-1/2">
                <h2 className="text-2xl font-semibold text-white">
                  {selectedUser.fullName}
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      isOnline ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                  {isOnline && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/20 text-emerald-400 border-none"
                    >
                      Active
                    </Badge>
                  )}
                  
                </div>
                <div className="flex items-center gap-2">
                  <span>
                  {isPlaying && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/20 text-xs text-emerald-400 border-none truncate"
                    >
                      <AudioWaveform className="size-3 mr-1 animate-pulse" />
                      {activity.replace("Playing ", "")}
                    </Badge>
                  )}</span>
                </div>
              </div>
            </motion.div>
            {/* Close Button */}
            <div className="absolute bottom-4 right-4">
              <Button
                variant="ghost"
                onClick={() => setIsProfileDialogOpen(false)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200 px-4 py-2"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menubar */}
        <Menubar className="bg-transparent border-none">
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1 text-zinc-300 hover:text-emerald-400 bg-zinc-800/50 px-3 py-1 rounded-md transition-colors">
              <Ellipsis className="sm:h-5 sm:w-5 h-3 w-3" />
            </MenubarTrigger>
            <MenubarContent className="bg-zinc-800 border-zinc-700 text-zinc-300 rounded-md shadow-lg">
              <MenubarItem
                className="hover:bg-zinc-700 hover:text-emerald-400"
                onClick={handleOpenProfile}
              >
                <User2 className="mr-2 h-4 w-4" /> View Profile
              </MenubarItem>
              <MenubarItem className="hover:bg-zinc-700 hover:text-emerald-400">
                <Phone className="mr-2 h-4 w-4" /> Start Call
              </MenubarItem>
              <MenubarItem className="hover:bg-zinc-700 hover:text-emerald-400">
                <MessageCircle className="mr-2 h-4 w-4" /> Send Message
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </motion.div>
  );
};

export default ChatHeader;