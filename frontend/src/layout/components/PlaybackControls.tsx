import * as React from "react";
import {
  Slider as SliderPrimitiveRoot,
  SliderTrack as SliderPrimitiveTrack,
  SliderRange as SliderPrimitiveRange,
  SliderThumb as SliderPrimitiveThumb,
} from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayerStore } from "@/stores/usePlayerStore";
import {
  Contact,
  ListMusic,
  Pause,
  Play,
  RefreshCwOff,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/useChatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { useAuth } from "@clerk/clerk-react";

// Custom Slider kiểu SoundCloud
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitiveRoot>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitiveRoot>
>(({ className, ...props }, ref) => (
  <SliderPrimitiveRoot
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group cursor-pointer",
      className
    )}
    {...props}
  >
    <SliderPrimitiveTrack className="relative h-[1px] w-full grow overflow-hidden bg-zinc-700/50">
      <SliderPrimitiveRange className="absolute h-full bg-[#87DF2C]" />
    </SliderPrimitiveTrack>
    <SliderPrimitiveThumb className="block h-2 w-2 rounded-full bg-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-100 cursor-grab disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitiveRoot>
));
Slider.displayName = SliderPrimitiveRoot.displayName;

// Popover Components
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-32 rounded-md bg-zinc-900 border border-zinc-800 p-2 shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

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

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PlaybackControls: React.FC = () => {
  const { isMobile } = useSidebar();
  const {
    audio,
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    shuffleQueue,
    currentIndex,
    queue,
    volume,
    setVolume,
    repeatMode, 
    setRepeatMode,
    fetchQueue,
  } = usePlayerStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth(); // Clerk's userId (clerkId)

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [selectedQueue, setSelectedQueue] = useState<boolean>(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    const handleEnded = () => {
      playNext(userId || ""); // Pass userId if available, otherwise empty string
    };

    audio.addEventListener("ended", handleEnded);

    // Set initial volume
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audio, playNext, volume, userId]); // Simplified dependencies

  const handleSeek = (value: number[]) => {
    if (audio) {
      audio.currentTime = value[0];
    }
  };

  const toggleQueuePage = () => {
    if (location.pathname === "/queue") {
      if (previousPath) {
        navigate(previousPath);
        setPreviousPath(null);
      }
    } else {
      setSelectedQueue(!selectedQueue);
      if (!selectedQueue) {
        setPreviousPath(location.pathname);
        navigate("/queue");
      }
    }
  };

  useEffect(() => {
    if (location.pathname !== "/queue" && selectedQueue) {
      setSelectedQueue(false);
    }
  }, [location.pathname, selectedQueue]);

  const handleToggleRepeat = () => {
    // Update to match store's repeatMode values
    setRepeatMode(
      repeatMode === "off" ? "queue" : repeatMode === "queue" ? "song" : "off"
    );
  };

  const { users, fetchUsers, selectedUser, setSelectedUser, onlineUsers } =
    useChatStore();

  const handleUserClick = (user: User) => {
    if (selectedUser?.clerkId !== user.clerkId) {
      setSelectedUser(user);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (audio) audio.volume = volume / 100;
  }, [audio, volume]);

  useEffect(() => {
    const userId = useChatStore.getState().info?._id;
    if (userId) fetchQueue(userId);
  }, [fetchQueue]);
  // useEffect(() => {
  //   if (userId) {
  //     fetchQueue(userId); // Fetch queue only if userId exists
  //   }
  // }, [fetchQueue, userId]);


  return (
    <footer className="fixed w-full bottom-0 left-0 z-10 h-16 sm:h-20 bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 border-t border-zinc-800 px-2 sm:px-4">
      <div className="flex sm:flex-row justify-between items-center h-full max-w-[1800px] mx-auto gap-2 sm:gap-0">
        {/* Currently playing song */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-[30%] min-w-0">
          {currentSong && (
            <>
              <img
                src={currentSong.imageUrl}
                alt={currentSong.title}
                className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-md shadow-md"
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/songs/${currentSong._id}`}
                  className="text-xs sm:text-sm font-medium text-white truncate hover:underline"
                >
                  {currentSong.title}
                </Link>
                <Link to={`/artists/${currentSong.artists[0]._id}`}>
                  <p className="text-xs text-zinc-400 truncate hover:underline">
                    {currentSong.artists[0].name}
                  </p>
                </Link>
              </div>
            </>
          )}
          {!currentSong && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-zinc-700 rounded-md animate-pulse" />
                <span className="text-xs sm:text-sm text-zinc-400">
                  No song playing
                </span>
              </div>
            </>
          )}
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center gap-1 sm:gap-1 w-full sm:w-[40%] max-w-full">
          <div className="flex items-center gap-1 sm:gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={shuffleQueue}
                    className="text-zinc-400 hover:text-white transition-all duration-200"
                    disabled={!currentSong}
                  >
                    <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shuffle Queue</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => playPrevious(userId || "")}
              className="text-zinc-400 hover:text-white hover:fill-zinc-400 transition-all duration-200"
              disabled={!currentSong}
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5 fill-zinc-400" />
            </Button>
            <Button
              size="icon"
              onClick={() => togglePlay(userId || "")}
              className="bg-sky-500 hover:bg-sky-400 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 shadow-md hover:scale-105 transition-all duration-200"
              disabled={!currentSong}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-white" />
              ) : (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => playNext(userId || "")}
              className="text-zinc-400 hover:text-white hover:fill-zinc-400 transition-all duration-200"
              disabled={!currentSong}
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 fill-zinc-400" />
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    variant="default"
                    pressed={repeatMode !== "off"}
                    onPressedChange={handleToggleRepeat}
                    className="text-zinc-400 hover:text-white data-[state=on]:text-sky-500 transition-all duration-200"
                    disabled={!currentSong}
                  >
                    {repeatMode === "song" && (
                      <Repeat1 className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    {repeatMode === "queue" && (
                      <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    {repeatMode === "off" && (
                      <RefreshCwOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {repeatMode === "off"
                      ? "Repeat Off"
                      : repeatMode === "queue"
                      ? "Repeat Queue"
                      : "Repeat Song"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-zinc-400 font-mono">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              className="w-full"
              onValueChange={handleSeek}
              disabled={!currentSong}
            />
            <span className="text-xs text-zinc-400 font-mono">
              {formatTime(currentSong?.duration || duration || 0)}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-[30%] justify-end">
          <PopoverPrimitive.Root>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverPrimitive.Trigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white transition-all duration-200"
                    >
                      <ListMusic
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          selectedQueue ? "text-emerald-500" : ""
                        }`}
                      />
                    </Button>
                  </PopoverPrimitive.Trigger>
                </TooltipTrigger>
                <TooltipContent side={isMobile ? "top" : "left"}>
                  <p>Queue</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <QueuePopoverContent side={isMobile ? "top" : "top"} align="end">
              <ScrollArea className="h-40">
                <div className="flex flex-col gap-2 p-2">
                  <h3 className="text-sm font-medium text-zinc-300">
                    Next in Queue
                  </h3>
                  {queue.length === 0 ? (
                    <p className="text-xs text-zinc-400">Queue is empty</p>
                  ) : (
                    queue
                      .slice(currentIndex + 1, currentIndex + 6)
                      .map((song) => (
                        <div
                          key={song._id}
                          className="flex items-center gap-2 p-1 hover:bg-zinc-800/50 rounded-md"
                        >
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="w-8 h-8 rounded-sm object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">
                              {song.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">
                              {song.artists[0].name}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 text-xs text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                onClick={toggleQueuePage}
              >
                View Full Queue
              </Button>
            </QueuePopoverContent>
          </PopoverPrimitive.Root>
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white transition-all duration-200"
                    >
                      <Contact className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side={isMobile ? "top" : "left"}>
                  <p>Friends</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent
              className="w-56 rounded-lg bg-zinc-900/95 border-zinc-800 shadow-md"
              side={isMobile ? "top" : "top"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="px-2 py-1 text-sm text-zinc-300">
                Your Friends
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuGroup>
                <ScrollArea className="h-[180px]">
                  {users.map((user) => (
                    <DropdownMenuItem
                      key={user.clerkId}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-zinc-800/50"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-zinc-900 ${
                            onlineUsers.has(user.clerkId)
                              ? "bg-green-500"
                              : "bg-zinc-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-zinc-100 truncate">
                          {user.fullName}
                        </span>
                        <span className="text-xs text-zinc-400 truncate block">
                          {onlineUsers.has(user.clerkId) ? "Online" : "Offline"}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-1 sm:gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-zinc-400 hover:text-white transition-all duration-200"
                >
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Slider
                  orientation="horizontal"
                  value={[volume * 100]}
                  max={100}
                  min={0}
                  step={1}
                  className="sm:w-24 hover:cursor-grab active:cursor-grabbing"
                  onValueChange={(value) => {
                    setVolume(value[0]);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PlaybackControls;
