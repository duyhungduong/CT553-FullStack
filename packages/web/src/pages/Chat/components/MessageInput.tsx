import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useChatStore } from "@/stores/useChatStore";
// import { useUser } from "@clerk/clerk-react";
// import { SendHorizonal, Sticker } from "lucide-react";
// import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MessageInput = () => {
  // const [newMessage, setNewMessage] = useState("");
  // const [messageType, setMessageType] = useState<"text" | "sticker" | "track">("text");
  // const { user } = useUser();
  // const { 
  //   selectedUser, 
  //   sendMessage, 
  //   conversationId, 
  //   // fetchUserStickers, 
  //   // fetchUserTracks 
  // } = useChatStore();
  // const [stickers, setStickers] = useState<any[]>([]);
  // const [tracks, setTracks] = useState<any[]>([]);

  // useEffect(() => {
  //   const loadExtras = async () => {
  //     const stickerList = await fetchUserStickers();
  //     const trackList = await fetchUserTracks();
  //     setStickers(stickerList);
  //     setTracks(trackList);
  //   };
  //   if (user) loadExtras();
  // }, [user, fetchUserStickers, fetchUserTracks]);

  // const handleSend = () => {
  //   if (!selectedUser || !user || !conversationId) return;

  //   if (messageType === "text" && newMessage.trim()) {
  //     sendMessage(conversationId, user.id, newMessage.trim(), "text");
  //     setNewMessage("");
  //   }
  // };

  // const handleStickerSend = (stickerId: string) => {
  //   if (!selectedUser || !user || !conversationId) return;
  //   sendMessage(conversationId, user.id, "", "sticker", undefined, stickerId);
  // };

  // const handleTrackSend = (trackId: string) => {
  //   if (!selectedUser || !user || !conversationId) return;
  //   sendMessage(conversationId, user.id, "", "track", trackId);
  // };

  return (
    <div className="p-4 mt-auto border-t border-zinc-800 bg-zinc-900">
      <div className="flex gap-3 items-center">
        {/* <Input
          placeholder={`Send a message to ${selectedUser?.fullName || "someone"}`}
          value={newMessage}
          onChange={(e) => {
            setMessageType("text");
            setNewMessage(e.target.value);
          }}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring focus:ring-blue-500 focus:outline-none text-zinc-100 placeholder-zinc-500 p-3 transition"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={messageType !== "text"}
        /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="bg-gray-700 hover:bg-gray-600">
              {/* <Sticker className="h-5 w-5" /> */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 text-white">
            {/* {stickers.map((sticker) => (
              <DropdownMenuItem key={sticker._id} onClick={() => handleStickerSend(sticker._id)}>
                <img src={sticker.image_url} alt={sticker.name} className="w-8 h-8 mr-2" />
                {sticker.name}
              </DropdownMenuItem>
            ))} */}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="bg-gray-700 hover:bg-gray-600">
              <Music className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 text-white">
            {tracks.map((track) => (
              <DropdownMenuItem key={track._id} onClick={() => handleTrackSend(track._id)}>
                {track.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}
        {/* <Button
          size="icon"
          onClick={handleSend}
          disabled={messageType === "text" && !newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 focus:ring focus:ring-blue-400 focus:outline-none text-white p-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button> */}
      </div>
    </div>
  );
};

export default MessageInput;