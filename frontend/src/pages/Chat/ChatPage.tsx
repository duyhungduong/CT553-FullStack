import React, { useEffect, useState, useRef, useCallback } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { User } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Gift,
  Image,
  ImageDown,
  ImageOff,
  Send,
  Sticker,
  Upload,
  X,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { useUser } from "@clerk/clerk-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { formatTimeAgo } from "@/utils/timeFormatter";
import { Badge } from "@/components/ui/badge";
import { useStickerStore } from "@/stores/useStickerStore";
import axios from "axios";
import AddStickerDialog from "../library/components/Sticker/AddStickerDialog";
import { debounce } from "lodash";
import NoConversationPlaceholder from "./components/NoConversationPlaceholder";

// Custom PopoverContent for Queue Preview
const QueuePopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-lg bg-zinc-900/95 p-2 shadow-md border border-zinc-800/20",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
QueuePopoverContent.displayName = PopoverPrimitive.Content.displayName;

interface TypingIndicatorProps {
  typingUsers: Map<string, string>;
  selectedUser: User | null;
  conversationId: string | null;
}

const TypingIndicator = ({
  typingUsers,
  selectedUser,
  conversationId,
}: TypingIndicatorProps) => {
  return (
    <AnimatePresence>
      {selectedUser &&
        typingUsers.has(selectedUser.clerkId) &&
        typingUsers.get(selectedUser.clerkId) === conversationId && (
          <motion.div
            className="absolute bottom-40 flex items-center gap-2 text-sm text-green-400 z-10 bg-zinc-900/30 backdrop-blur-sm p-2 rounded-md" // Thêm position absolute và nền trong suốtinitial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
              delay: 0.2,
            }}
          >
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={selectedUser?.imageUrl}
                alt={selectedUser?.fullName}
              />
              <AvatarFallback>{selectedUser?.fullName[0]}</AvatarFallback>
            </Avatar>
            <span>{selectedUser?.fullName} is typing</span>
            <motion.div className="flex gap-1">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
              >
                .
              </motion.span>
            </motion.div>
          </motion.div>
        )}
    </AnimatePresence>
  );
};

const ChatPage: React.FC = () => {
  const {
    info,
    messages,
    conversations,
    selectedUser,
    conversationId,
    typingUsers,
    friends,
    fetchUsers,
    fetchFriends,
    fetchMessages,
    sendMessage,
    joinConversation,
    startTyping,
    stopTyping,
    initSocket,
    isConnected,
    setSelectedUser,
    onlineUsers,
    sendSticker,
    sendGif,
  } = useChatStore();

  const {
    stickers,
    stickerPacks,
    userStickerPacks,
    fetchStickers,
    fetchStickerPacks,
    fetchUserStickerPacks,
    purchaseStickerPack,
  } = useStickerStore();

  const GIPHY_KEY = "FcOY7ak0xE0wVlYIaJxqXHlX580haOHo";
  // const apiUrl = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  // console.log(apiUrl);
  const [isGifPopoverOpen, setIsGifPopoverOpen] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);

  const fetchGifs = async (query: string) => {
    try {
      const response = await axios.get("https://api.giphy.com/v1/gifs/search", {
        params: {
          api_key: GIPHY_KEY || "FcOY7ak0xE0wVlYIaJxqXHlX580haOHo",
          q: query || "music",
          limit: 20, // Số lượng GIF trả về
          lang: "en",
        },
      });
      setGifs(response.data.data);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
    }
  };

  const debouncedFetchGifs = useCallback(
    debounce((query: string) => {
      fetchGifs(query);
    }, 100), // Debounce 100ms
    [fetchGifs]
  );

  useEffect(() => {
    if (isGifPopoverOpen) {
      debouncedFetchGifs(gifSearchQuery);
    }

    // Hủy debounce khi component unmount hoặc Popover đóng
    return () => {
      debouncedFetchGifs.cancel();
    };
  }, [isGifPopoverOpen, gifSearchQuery, debouncedFetchGifs]);

  const handleSendGif = async (gifUrl: string) => {
    if (!conversationId) return;
    await sendGif({ conversationId, gifUrl });
    // setIsGifPopoverOpen(false);
  };

  const [files, setFiles] = useState<{
    image: File | null;
  }>({
    image: null,
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isStickerPopoverOpen, setIsStickerPopoverOpen] = useState(false);
  const [searchStickerQuery, setSearchStickerQuery] = useState("");
  const [selectedPack, setSelectedPack] = useState<string | null>(null); // Để hiển thị sticker của pack được chọn
  const [messageInput, setMessageInput] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { user } = useUser();

  const usersListPanelRef = useRef<any>(null);
  const chatPanelRef = useRef<any>(null);

  const [usersListWidth, setUsersListWidth] = useState(() => {
    const savedSize = localStorage.getItem("usersListWidth");
    return savedSize ? parseInt(savedSize, 10) : 25;
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?.id) {
      initSocket(user.id);
      fetchUsers();
      fetchFriends();
    }
  }, [user, initSocket, fetchUsers, fetchFriends]);

  useEffect(() => {
    if (conversationId && isConnected) {
      fetchMessages(conversationId);
      joinConversation(conversationId);
    }
  }, [conversationId, isConnected, fetchMessages, joinConversation]);

  useEffect(() => {
    if (conversationId && messages[conversationId]?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationId, messages]);

  useEffect(() => {
    if (user?.id) {
      fetchStickers({ page: 1, limit: 100 }); // Lấy tất cả sticker
      fetchStickerPacks(); // Lấy tất cả sticker pack
      if (info?._id) fetchUserStickerPacks(info?._id); // Lấy sticker pack của user
    }
  }, [user, fetchStickers, fetchStickerPacks, fetchUserStickerPacks, info]);

  useEffect(() => {
    if (user?.id) {
      const cleanup = initSocket(user.id);
      return cleanup; // Cleanup khi component unmount
    }
  }, [user, initSocket]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files![0] || null;
    if (selectedFile) {
      setFiles((prev) => ({ ...prev, image: selectedFile }));
      setIsPopoverOpen(true); // Giữ Popover mở khi thêm ảnh
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImage(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const imageFile = droppedFiles[0];
      if (imageFile.type.startsWith("image/")) {
        setFiles((prev) => ({ ...prev, image: imageFile }));
        setIsPopoverOpen(true);
      } else {
        toast.error("Please upload a valid image file!");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!conversationId || (!messageInput.trim() && !files.image)) {
      toast.error("Please enter a message or attach an image");
      return;
    }
    if (!selectedUser) {
      toast.error("Please select a friend to chat with");
      return;
    }

    try {
      await sendMessage({
        conversationId,
        content: messageInput.trim() || undefined,
        image: files.image || undefined,
      });
      setFiles({ image: null });
      setMessageInput("");
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleFocus = () => {
    if (conversationId) startTyping(conversationId);
  };

  const handleBlur = () => {
    if (conversationId) stopTyping(conversationId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Hàm toggle thu gọn/mở rộng với animation
  const toggleCollapse = () => {
    const newSize = isCollapsed ? 25 : 5;
    setUsersListWidth(newSize);
    setIsCollapsed(!isCollapsed);

    if (usersListPanelRef.current && chatPanelRef.current) {
      usersListPanelRef.current.resize(newSize);
      chatPanelRef.current.resize(100 - newSize);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky z-20 flex items-center gap-4 border-b border-zinc-700 bg-zinc-800/80 p-4 backdrop-blur-md"
      >
        <SidebarTrigger className="text-zinc-300 hover:text-white" />
        <Separator orientation="vertical" className="h-6 bg-zinc-600" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-300">
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to="/message">Messages</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.header>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex h-[calc(100vh-64px)]"
      >
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel
            ref={usersListPanelRef}
            defaultSize={usersListWidth}
            minSize={isMediumScreen ? 12 : 6}
            maxSize={isMediumScreen ? 15 : 40}
            onResize={(size) => {
              setUsersListWidth(size);
              setIsCollapsed(size <= 5);
            }}
            className="bg-zinc-900/50 border-r border-zinc-700 relative"
          >
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full p-2 justify-center items-center"
            >
              <ScrollArea className="h-full">
                <AnimatePresence>
                  {isMediumScreen || usersListWidth < 10 ? (
                    <div className="flex flex-col h-full relative">
                      <ScrollArea className="h-full">
                        <TooltipProvider>
                          {conversations.map((conversation) => {
                            if (!conversation.participants) {
                              console.warn(
                                `No participants for conversation ${conversation._id}`,
                                conversation
                              );
                              return null;
                            }
                            const currentUserId =
                              useChatStore.getState().info?._id;
                            let otherParticipant;
                            if (Array.isArray(conversation.participants)) {
                              if (
                                typeof conversation.participants[0] === "string"
                              ) {
                                otherParticipant = friends.find(
                                  (friend) =>
                                    (
                                      conversation.participants as string[]
                                    ).includes(friend._id) &&
                                    friend._id !== currentUserId
                                );
                              } else {
                                otherParticipant = (
                                  conversation.participants as User[]
                                ).find((p) => p._id !== currentUserId);
                              }
                            }

                            if (!otherParticipant) {
                              console.warn(
                                `No valid participant found for conversation ${conversation._id}`
                              );
                              return null;
                            }

                            const previewText = conversation.last_message
                              ? conversation.last_message.content
                                ? conversation.last_message.content
                                : conversation.last_message.imageUrl
                                ? "Image"
                                : "No messages yet"
                              : "No messages yet";

                            const timeText = conversation.last_message?.sent_at
                              ? formatTimeAgo(conversation.last_message.sent_at)
                              : null;

                            return (
                              <motion.div
                                key={conversation._id}
                                className="my-2 cursor-pointer transition-all duration-200 flex justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="relative">
                                      <Avatar
                                        className={`h-10 w-10 cursor-pointer ${
                                          selectedUser?.clerkId ===
                                          otherParticipant.clerkId
                                            ? "border-blue-600 ring-2 ring-emerald-600/90"
                                            : "border-zinc-800 hover:border-zinc-700/75"
                                        }`}
                                        onClick={() =>
                                          setSelectedUser(otherParticipant)
                                        }
                                      >
                                        <AvatarImage
                                          src={otherParticipant.imageUrl}
                                        />
                                        <AvatarFallback>
                                          {otherParticipant.fullName[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <Badge
                                        variant={
                                          onlineUsers.has(
                                            otherParticipant.clerkId
                                          )
                                            ? "default"
                                            : "secondary"
                                        }
                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full p-0 ${
                                          onlineUsers.has(
                                            otherParticipant.clerkId
                                          )
                                            ? "bg-green-500"
                                            : "bg-zinc-500"
                                        }`}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <p className="text-sm">{previewText}</p>
                                    {timeText && (
                                      <p className="text-xs text-zinc-400">
                                        {timeText}
                                      </p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </motion.div>
                            );
                          })}
                        </TooltipProvider>
                      </ScrollArea>
                      {!isMediumScreen && usersListWidth < 10 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className=" text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-full"
                          onClick={toggleCollapse}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <UsersList
                      toggleCollapse={toggleCollapse}
                      isCollapsed={isCollapsed}
                    />
                  )}
                </AnimatePresence>
              </ScrollArea>
            </motion.div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-zinc-700 hover:bg-sky-500 transition-all duration-300 ease-in-out" />

          <ResizablePanel
            ref={chatPanelRef}
            defaultSize={100 - usersListWidth}
            className="flex-1"
          >
            <div className="flex flex-col h-full">
              <AnimatePresence>
                {selectedUser && conversationId ? (
                  <motion.div
                    className="flex-1 flex flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ChatHeader />
                    <ScrollArea className="px-4 py-1 bg-zinc-800/40 h-[calc(100vh-275px)]">
                      {messages[conversationId]?.map((msg) => {
                        const isCurrentUser = msg.senderId === info?.clerkId;
                        // Tìm thông tin người gửi nếu không phải current user
                        let sender: User | undefined;
                        if (!isCurrentUser && selectedUser) {
                          sender =
                            friends.find(
                              (friend) => friend.clerkId === msg.senderId
                            ) || selectedUser;
                        }

                        const timeText =
                          msg.sent_at && !isNaN(new Date(msg.sent_at).getTime())
                            ? new Date(msg.sent_at).toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                month: "short",
                                day: "2-digit",
                              })
                            : "Just now";

                        const isImageOnly = msg.imageUrl && !msg.content;

                        return (
                          <motion.div
                            key={msg._id}
                            className={cn(
                              "flex mb-4 items-start",
                              isCurrentUser ? "justify-end" : "justify-start"
                            )}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {!isCurrentUser && sender && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="mr-2 mt-1 flex-shrink-0"
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                                      <AvatarImage src={sender.imageUrl} />
                                      <AvatarFallback>
                                        {sender.fullName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                                    {sender.fullName}
                                  </TooltipContent>
                                </Tooltip>
                              </motion.div>
                            )}
                            <div
                              className={cn(
                                "flex flex-col gap-1",
                                isCurrentUser ? "items-end" : "items-start"
                              )}
                            >
                              <Card
                                className={cn(
                                  "rounded-lg shadow-none border-none hover:brightness-110 transition-all duration-100",
                                  isImageOnly
                                    ? "bg-transparent hover:brightness-100 backdrop-filter: blur(0) backdrop-blur-0 opacity-100"
                                    : isCurrentUser
                                    ? "bg-blue-600 rounded-l-3xl text-white"
                                    : "bg-zinc-700 rounded-r-3xl text-white"
                                )}
                              >
                                <CardContent
                                  className={cn("p-3", isImageOnly && "p-0")}
                                >
                                  {msg.imageUrl && (
                                    <Dialog
                                      open={
                                        isImageDialogOpen &&
                                        selectedImageUrl === msg.imageUrl
                                      }
                                      onOpenChange={(open) => {
                                        setIsImageDialogOpen(open);
                                        if (!open) setSelectedImageUrl(null);
                                      }}
                                    >
                                      <DialogTrigger asChild>
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            x: isCurrentUser ? -10 : 10,
                                          }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          onClick={() => {
                                            setSelectedImageUrl(
                                              msg.imageUrl ?? null
                                            );
                                            setIsImageDialogOpen(true);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <img
                                            src={msg.imageUrl}
                                            alt="Message image"
                                            className="max-w-full sm:max-w-[300px] rounded-md object-cover"
                                          />
                                        </motion.div>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[90vw] max-h-[90vh] bg-transparent border-none p-0 backdrop-blur-md">
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.9 }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="relative w-full h-full flex items-center justify-center"
                                        >
                                          <TransformWrapper
                                            initialScale={1}
                                            minScale={0.5}
                                            maxScale={3}
                                            wheel={{ step: 0.1 }}
                                            doubleClick={{ mode: "toggle" }}
                                            centerOnInit={true} // Đảm bảo ảnh được căn giữa khi khởi tạo
                                          >
                                            {({
                                              zoomIn,
                                              zoomOut,
                                              resetTransform,
                                            }) => (
                                              <>
                                                <TransformComponent
                                                  wrapperStyle={{
                                                    width: "100%",
                                                    height: "80vh",
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
                                                  <motion.img
                                                    src={msg.imageUrl}
                                                    alt="Full size image"
                                                    className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-lg"
                                                    style={{ margin: "auto" }}
                                                  />
                                                </TransformComponent>
                                                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                                                  <div className="text-white text-sm opacity-75">
                                                    {timeText} -{" "}
                                                    {isCurrentUser
                                                      ? "You"
                                                      : sender?.fullName ||
                                                        "Unknown"}
                                                  </div>
                                                  <div className="flex gap-2">
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
                                                      onClick={() =>
                                                        resetTransform()
                                                      }
                                                      className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200"
                                                    >
                                                      <RotateCcw className="h-5 w-5" />
                                                    </Button>
                                                  </div>
                                                </div>
                                                <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                                                  <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                      const link =
                                                        document.createElement(
                                                          "a"
                                                        );
                                                      link.href =
                                                        msg.imageUrl ?? "";
                                                      link.download = `image_${Date.now()}.jpg`;
                                                      link.click();
                                                    }}
                                                    className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200 px-4 py-2"
                                                  >
                                                    <ImageDown className="w-5 h-5 mr-2" />{" "}
                                                    Download
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    onClick={() =>
                                                      setIsImageDialogOpen(
                                                        false
                                                      )
                                                    }
                                                    className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200 px-4 py-2"
                                                  >
                                                    <ImageOff className="w-5 h-5 mr-2" />{" "}
                                                    Close
                                                  </Button>
                                                </div>
                                              </>
                                            )}
                                          </TransformWrapper>
                                        </motion.div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {msg.content && (
                                    <motion.p
                                      initial={{
                                        opacity: 0,
                                        x: isCurrentUser ? -10 : 10,
                                      }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className={cn(
                                        "text-sm break-words min-w-[19px] max-w-full",
                                        isCurrentUser && "text-right"
                                      )}
                                    >
                                      {msg.content}
                                    </motion.p>
                                  )}
                                </CardContent>
                              </Card>
                              <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className={cn(
                                  "text-xs px-1.5 py-0.5 rounded-full bg-zinc-800/50",
                                  isCurrentUser
                                    ? "text-blue-300 opacity-75"
                                    : "text-zinc-400 opacity-60"
                                )}
                              >
                                {timeText}
                              </motion.p>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </ScrollArea>

                    <motion.div
                      className="p-4 border-t bg-zinc-900 flex flex-col gap-2"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TypingIndicator
                        typingUsers={typingUsers}
                        selectedUser={selectedUser}
                        conversationId={conversationId}
                      />
                      <div className="flex items-center gap-2">
                        <Popover
                          open={isGifPopoverOpen}
                          onOpenChange={setIsGifPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-zinc-400 hover:text-white transition-all duration-200"
                            >
                              <Gift className="h-5 w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent  side="top" align="start" className="w-80 bg-zinc-900 border-zinc-800 rounded-lg p-2">
                            <div className="mb-3">
                              <Input
                                value={gifSearchQuery}
                                onChange={(e) =>
                                  setGifSearchQuery(e.target.value)
                                }
                                placeholder="Search GIFs..."
                                className="w-full bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 rounded-lg focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                              />
                            </div>
                            <ScrollArea className="h-60 w-full rounded-md">
                              <div className="grid grid-cols-4 gap-2 p-2">
                                {gifs.map((gif) => (
                                  <motion.div
                                    key={gif.id}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="cursor-pointer bg-zinc-800/50 rounded-lg p-1 hover:bg-zinc-700/50 transition-all duration-200"
                                    onClick={() =>
                                      handleSendGif(gif.images.fixed_height.url)
                                    }
                                  >
                                    <img
                                      src={gif.images.fixed_height.url}
                                      alt={gif.title}
                                      className="w-full h-16 object-cover rounded-md"
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                        <Popover
                          open={isStickerPopoverOpen}
                          onOpenChange={setIsStickerPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-zinc-400 hover:text-white transition-all duration-200"
                            >
                              <Sticker className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-80 bg-zinc-900 border-zinc-800 rounded-lg shadow-lg">
                            <Tabs
                              defaultValue="stickers"
                              className="w-full"
                              onValueChange={() => {
                                setSelectedPack(null); // Reset selectedPack khi đổi tab
                                setSearchStickerQuery(""); // Reset searchQuery khi đổi tab
                              }}
                            >
                              <TabsList className="flex border-b border-zinc-700 bg-zinc-800/50 rounded-t-lg">
                                <TabsTrigger
                                  value="stickers"
                                  className="flex-1 py-2 text-center text-zinc-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-sky-500 transition-all duration-200"
                                >
                                  Stickers
                                </TabsTrigger>
                                <TabsTrigger
                                  value="packs"
                                  className="flex-1 py-2 text-center text-zinc-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-sky-500 transition-all duration-200"
                                >
                                  Sticker Packs
                                </TabsTrigger>
                              </TabsList>

                              {/* Tab Stickers */}
                              <TabsContent value="stickers" className="pt-3">
                                <div className="flex justify-between items-center gap-2 mb-3">
                                <AddStickerDialog/>
                                  <Input
                                    value={searchStickerQuery}
                                    onChange={(e) =>
                                      setSearchStickerQuery(e.target.value)
                                    }
                                    placeholder="Search stickers by name or category..."
                                    className="w-full bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 rounded-lg focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                                  />
                                </div>
                                {selectedPack ? (
                                  <div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mb-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all duration-200"
                                      onClick={() => setSelectedPack(null)}
                                    >
                                      Back to All Stickers
                                    </Button>
                                    <ScrollArea className="h-60 w-full rounded-md">
                                      <div className="grid grid-cols-4 gap-3 p-2">
                                        {stickers
                                          .filter((sticker) =>
                                            userStickerPacks.some(
                                              (usp) =>
                                                usp.pack._id === selectedPack &&
                                                usp.pack.stickers?.some(
                                                  (s) => s._id === sticker._id
                                                )
                                            )
                                          )
                                          .filter((sticker) =>
                                            searchStickerQuery
                                              ? sticker.name
                                                  .toLowerCase()
                                                  .includes(
                                                    searchStickerQuery.toLowerCase()
                                                  ) ||
                                                sticker.category
                                                  .toLowerCase()
                                                  .includes(
                                                    searchStickerQuery.toLowerCase()
                                                  )
                                              : true
                                          )
                                          .map((sticker) => (
                                            <motion.div
                                              key={sticker._id}
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              className="cursor-pointer bg-zinc-800/50 rounded-lg p-1 hover:bg-zinc-700/50 transition-all duration-200"
                                              onClick={() => {
                                                if (conversationId) {
                                                  sendSticker({
                                                    conversationId,
                                                    stickerId: sticker._id,
                                                  });
                                                  setIsStickerPopoverOpen(
                                                    false
                                                  );
                                                }
                                              }}
                                            >
                                              <img
                                                src={sticker.image_url}
                                                alt={sticker.name}
                                                className="w-12 h-12 object-contain rounded-md"
                                              />
                                            </motion.div>
                                          ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                ) : (
                                  <ScrollArea className="h-60 w-full rounded-md">
                                    <div className="grid grid-cols-4 gap-3 p-2">
                                      {stickers
                                        .filter((sticker) =>
                                          searchStickerQuery
                                            ? sticker.name
                                                .toLowerCase()
                                                .includes(
                                                  searchStickerQuery.toLowerCase()
                                                ) ||
                                              sticker.category
                                                .toLowerCase()
                                                .includes(
                                                  searchStickerQuery.toLowerCase()
                                                )
                                            : true
                                        )
                                        .map((sticker) => (
                                          <motion.div
                                            key={sticker._id}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="cursor-pointer bg-zinc-800/50 rounded-lg p-1 hover:bg-zinc-700/50 transition-all duration-200"
                                            onClick={() => {
                                              if (conversationId) {
                                                sendSticker({
                                                  conversationId,
                                                  stickerId: sticker._id,
                                                });
                                                setIsStickerPopoverOpen(false);
                                              }
                                            }}
                                          >
                                            <img
                                              src={sticker.image_url}
                                              alt={sticker.name}
                                              className="w-12 h-12 object-contain rounded-md"
                                            />
                                          </motion.div>
                                        ))}
                                    </div>
                                  </ScrollArea>
                                )}
                              </TabsContent>

                              {/* Tab Sticker Packs */}
                              <TabsContent value="packs" className="pt-3">

                                <ScrollArea className="h-60 w-full rounded-md">
                                  
                                  <div className="grid grid-cols-2 gap-3 p-2">
                                    {stickerPacks.map((pack) => {
                                      const isOwned = userStickerPacks.some(
                                        (usp) => usp.pack._id === pack._id
                                      );
                                      return (
                                        <motion.div
                                          key={pack._id}
                                          whileHover={{ scale: 1.05 }}
                                          className="p-3 bg-zinc-800/50 rounded-lg flex flex-col items-center shadow-sm hover:bg-zinc-700/50 transition-all duration-200"
                                        >
                                          <span className="text-sm font-medium text-white mb-2">
                                            {pack.name}
                                          </span>
                                          <div className="flex gap-2 mb-3">
                                            {pack.stickers
                                              ?.slice(0, 3)
                                              .map((sticker) => (
                                                <img
                                                  key={sticker._id}
                                                  src={sticker.image_url}
                                                  alt={sticker.name}
                                                  className="w-8 h-8 object-contain rounded-md"
                                                />
                                              ))}
                                          </div>
                                          {pack.is_premium && !isOwned ? (
                                            <Button
                                              size="sm"
                                              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-200"
                                              onClick={() => {
                                                if (user?.id) {
                                                  purchaseStickerPack(
                                                    user.id,
                                                    pack._id
                                                  );
                                                  setIsStickerPopoverOpen(
                                                    false
                                                  );
                                                }
                                              }}
                                            >
                                              Buy (${pack.price})
                                            </Button>
                                          ) : (
                                            <Button
                                              size="sm"
                                              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200"
                                              onClick={() =>
                                                setSelectedPack(pack._id)
                                              }
                                            >
                                              Use Pack
                                            </Button>
                                          )}
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                            </Tabs>
                          </PopoverContent>
                        </Popover>
                        <Popover
                          open={isPopoverOpen}
                          onOpenChange={setIsPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-zinc-400 hover:text-white transition-all duration-200"
                            >
                              <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-72 bg-zinc-900 border-zinc-800">
                            <div
                              className={`relative w-full max-w-lg h-40 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
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
                                onChange={handleFileChange}
                              />
                              {files.image ? (
                                <motion.div className="relative w-full h-full">
                                  <img
                                    src={URL.createObjectURL(files.image)}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-md shadow-lg max-h-96"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-zinc-800/80 text-white hover:bg-zinc-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFiles((prev) => ({
                                        ...prev,
                                        image: null,
                                      }));
                                      setIsPopoverOpen(false); // Đóng Popover khi xóa ảnh
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              ) : (
                                <div className="text-center text-zinc-400">
                                  <Upload className="h-8 w-8 mx-auto mb-3" />
                                  <p className="text-sm">
                                    Drag or click to upload image
                                  </p>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          value={messageInput}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          className="flex-1 bg-zinc-800 border border-zinc-700 text-white"
                        />
                        
                        <Button
                          onClick={handleSendMessage}
                          size="icon"
                          variant="ghost"
                          className="text-zinc-400 hover:text-white transition-all duration-200"
                        >
                          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    
                    <NoConversationPlaceholder />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Delete Dialog */}
        <AnimatePresence>
          {deleteDialogOpen && (
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Delete Message
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      Are you sure you want to delete this message? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      className="text-zinc-300 border-zinc-700 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (messageToDelete && conversationId) {
                          // deleteMessage(messageToDelete, conversationId);
                          setDeleteDialogOpen(false);
                          setMessageToDelete(null);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </motion.div>
            </AlertDialog>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ChatPage;
