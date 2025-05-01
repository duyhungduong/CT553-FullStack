import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  HeadphonesIcon,
  Users,
  Disc,
  AudioWaveform,
  UserPlus,
  Check,
  X,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion"; // Add Framer Motion

const FriendsActivity = () => {
  const {
    users,
    friends,
    pendingRequests,
    fetchUsers,
    fetchFriends,
    fetchPendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    onlineUsers,
    userActivities,
    setSelectedUser,
    initSocket,
  } = useChatStore();
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchFriends();
      fetchPendingRequests();
      initSocket(user.id);
      fetchSentRequests();
    }
    return () => {
      useChatStore.getState().disconnectSocket();
    };
  }, [fetchUsers, fetchFriends, fetchPendingRequests, initSocket, user]);

  const fetchSentRequests = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await fetch(
        "http://localhost:5000/api/users/pending-requests-sent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch sent requests");
      const data = await response.json();
      setSentRequests(data);
    } catch (error) {
      console.error("Failed to fetch sent friend requests:", error);
    }
  };

  const handleChatWithFriend = (friend: any) => {
    setSelectedUser(friend);
    navigate("/message");
  };

  const handleSendFriendRequest = async (clerkId: string) => {
    await sendFriendRequest(clerkId);
    fetchPendingRequests();
    fetchSentRequests();
  };

  const handleAcceptFriendRequest = async (friendshipId: string) => {
    await acceptFriendRequest(friendshipId);
    fetchSentRequests();
  };

  const handleDeclineFriendRequest = async (friendshipId: string) => {
    await declineFriendRequest(friendshipId);
    fetchSentRequests();
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aIsFriend = friends.some((f) => f.clerkId === a.clerkId);
    const bIsFriend = friends.some((f) => f.clerkId === b.clerkId);
    const aIsOnline = onlineUsers.has(a.clerkId);
    const bIsOnline = onlineUsers.has(b.clerkId);
    const aActivity = userActivities.get(a.clerkId);
    const bActivity = userActivities.get(b.clerkId);
    const aIsPlaying = aActivity && aActivity !== "Idle";
    const bIsPlaying = bActivity && bActivity !== "Idle";

    if (aIsFriend && !bIsFriend) return -1;
    if (!aIsFriend && bIsFriend) return 1;
    if (aIsPlaying && !bIsPlaying) return -1;
    if (!aIsPlaying && bIsPlaying) return 1;
    if (aIsOnline && !bIsOnline) return -1;
    if (!aIsOnline && bIsOnline) return 1;
    return a.fullName.localeCompare(b.fullName);
  });

  if (user && users.length === 0) return <div>Loading friends...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen bg-gradient-to-b from-zinc-900 to-black shadow-xl overflow-hidden border border-zinc-800"
    >
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="sticky top-0 z-20 flex items-center gap-4 border-b border-zinc-700 bg-zinc-800/80 p-4 backdrop-blur-md"
      >
        <SidebarTrigger className="-ml-1 text-zinc-300 hover:text-white" />
        <Separator orientation="vertical" className="h-6 bg-zinc-700" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-300">
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={"/friends-activity"}>Friends' Music Vibes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.header>

      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-4 bg-zinc-900/50 border-b border-zinc-800/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Users className="size-5 text-emerald-400" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <h2 className="font-semibold text-white text-lg tracking-tight">
              Friends' Music Vibes
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFriends()}
                className="text-zinc-300 hover:text-emerald-400 border-zinc-700"
              >
                Refresh
              </Button>
            </motion.div>
            <Dialog>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-zinc-300 hover:text-emerald-400 border-zinc-700"
                  >
                    <UserCheck className="size-4 mr-2" />
                    Sent Requests
                    {sentRequests.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Badge className="ml-2 bg-emerald-500">
                          {sentRequests.length}
                        </Badge>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Sent Friend Requests</DialogTitle>
                  <DialogDescription>
                    View and manage friend requests you've sent to others.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[300px]">
                  {sentRequests.length === 0 ? (
                    <p className="text-zinc-400 text-center py-4">
                      No sent friend requests.
                    </p>
                  ) : (
                    <div className="space-y-3 p-4">
                      <AnimatePresence>
                        {sentRequests.map((request) => (
                          <motion.div
                            key={request._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-md border border-zinc-700"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage
                                  src={request.user_id2.imageUrl}
                                  alt={request.user_id2.fullName}
                                />
                                <AvatarFallback>
                                  {request.user_id2.fullName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white text-sm">
                                {request.user_id2.fullName}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {request.status === "pending" && (
                                <span className="text-zinc-400 text-xs">
                                  Pending
                                </span>
                              )}
                              {request.status === "accepted" && (
                                <Badge className="bg-emerald-500">
                                  Accepted
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.header>

      {!user && <LoginPrompt />}

      {user && (
        <ScrollArea className="flex-1">
          <AnimatePresence>
            {pendingRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4"
              >
                <h3 className="text-sm font-semibold text-zinc-300 mb-2">
                  Pending Requests
                </h3>
                <div className="space-y-2">
                  {pendingRequests.map((friendship) => (
                    <motion.div
                      key={friendship._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-md border border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={friendship.user_id1.imageUrl}
                            alt={friendship.user_id1.fullName}
                          />
                          <AvatarFallback>
                            {friendship.user_id1.fullName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm">
                          {friendship.user_id1.fullName}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleAcceptFriendRequest(friendship._id)
                                  }
                                  className="text-emerald-400 hover:text-emerald-300"
                                >
                                  <Check className="size-4" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Accept Friend Request
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeclineFriendRequest(friendship._id)
                                  }
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="size-4" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Decline Friend Request
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 space-y-3">
            <AnimatePresence>
              {sortedUsers.map((friend) => {
                const activity = userActivities.get(friend.clerkId);
                const isPlaying = activity && activity !== "Idle";
                const isOnline = onlineUsers.has(friend.clerkId);
                const isFriend = friends.some(
                  (f) => f.clerkId === friend.clerkId
                );
                const hasPendingRequest = pendingRequests.some(
                  (r) => r.user_id1.clerkId === friend.clerkId
                );

                return (
                  <motion.div
                    key={friend._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="group relative overflow-hidden rounded-lg bg-zinc-800/30 p-3 hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800/50 hover:border-zinc-700"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="size-11 border-2 border-zinc-800/50 transition-all group-hover:border-emerald-500/50">
                            <AvatarImage
                              src={friend.imageUrl}
                              alt={friend.fullName}
                            />
                            <AvatarFallback className="bg-zinc-800 text-emerald-400">
                              {friend.fullName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <motion.div
                            animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black 
                              ${isOnline ? "bg-emerald-400" : "bg-zinc-600"}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm tracking-tight">
                              {friend.fullName}
                            </span>
                            {isPlaying && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-500/20 text-emerald-400 border-none"
                                >
                                  <AudioWaveform className="size-3 mr-1 animate-pulse" />
                                  Playing
                                </Badge>
                              </motion.div>
                            )}
                            {isFriend && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Badge
                                  variant="outline"
                                  className="text-emerald-400 border-emerald-400/50"
                                >
                                  Friend
                                </Badge>
                              </motion.div>
                            )}
                          </div>

                          {isPlaying ? (
                            <div className="mt-1.5">
                              <div className="text-sm text-white font-medium truncate flex items-center gap-1">
                                <Disc className="size-3.5 text-emerald-400 animate-spin-slow" />
                                {
                                  activity
                                    .replace("Playing ", "")
                                    .split(" by ")[0]
                                }
                              </div>
                              <div className="text-xs text-zinc-400 truncate mt-0.5">
                                by {activity.split(" by ")[1]}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1.5 text-xs font-medium">
                              <span
                                className={
                                  isOnline
                                    ? "text-emerald-400"
                                    : "text-zinc-500"
                                }
                              >
                                {isOnline ? "Online • Listening" : "Offline"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isFriend &&
                          !hasPendingRequest &&
                          friend.clerkId !== user?.id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleSendFriendRequest(friend.clerkId)
                                      }
                                      className="text-zinc-300 hover:text-emerald-400"
                                    >
                                      <UserPlus className="size-4" />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Send Friend Request
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-zinc-300 hover:text-emerald-400"
                              >
                                <span className="sr-only">Actions</span>
                                <svg
                                  className="size-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  />
                                </svg>
                              </Button>
                            </motion.div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
                            <DropdownMenuItem
                              onClick={() => handleChatWithFriend(friend)}
                              className="hover:bg-zinc-700 hover:text-emerald-400"
                            >
                              Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </motion.div>
  );
};

const LoginPrompt = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-b from-zinc-900 to-black"
  >
    <div className="relative">
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative bg-zinc-900/80 rounded-full p-5 border border-zinc-800/50"
      >
        <HeadphonesIcon className="size-10 text-emerald-400" />
      </motion.div>
    </div>

    <div className="space-y-3 max-w-[280px]">
      <h3 className="text-xl font-bold text-white tracking-tight">
        Discover Friends' Tunes
      </h3>
      <p className="text-sm text-zinc-300 leading-relaxed">
        Sign in to see what beats your friends are vibing to right now
      </p>
    </div>

    <motion.div
      animate={{ width: [20, 40, 20] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
    />
  </motion.div>
);

export default FriendsActivity;
