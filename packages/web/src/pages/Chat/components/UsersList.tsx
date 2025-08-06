import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/useChatStore";
import { User } from "@/types";
import { Image, ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateConversationDialog from "./CreateConversationDialog";
import { formatTimeAgo } from "@/utils/timeFormatter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

interface UsersListProps {
  toggleCollapse: () => void;
  isCollapsed: boolean;
}

const UsersList: React.FC<UsersListProps> = ({ toggleCollapse, isCollapsed }) => {
  const {
    friends,
    selectedUser,
    setSelectedUser,
    onlineUsers,
    conversations,
    fetchConversations,
    fetchLastMessage,
  } = useChatStore();

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    conversations.forEach((conversation) => {
      if (!conversation.last_message) {
        fetchLastMessage(conversation._id);
      }
    });
  }, [conversations, fetchLastMessage]);

  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center h-full text-zinc-400"
      >
        No conversations yet
      </motion.div>
    );
  }

  return (
    <motion.div
      className="border-r border-zinc-800 bg-zinc-900 h-full"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col h-full">
        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 border-b border-zinc-700">
              <span className="text-sm font-semibold text-zinc-100">Messages</span>
              <div className="flex items-center gap-2">
                <CreateConversationDialog />
                {(!isCollapsed || isLargeScreen) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-full"
                    onClick={toggleCollapse}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5" />
                    ) : (
                      <ChevronLeft className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <AnimatePresence>
                  {conversations.map((conversation) => {
                    if (!conversation.participants) {
                      console.warn(
                        `No participants for conversation ${conversation._id}`,
                        conversation
                      );
                      return null;
                    }
                    const currentUserId = useChatStore.getState().info?._id;
                    let otherParticipant;
                    if (Array.isArray(conversation.participants)) {
                      if (typeof conversation.participants[0] === "string") {
                        otherParticipant = friends.find(
                          (friend) =>
                            (conversation.participants as string[]).includes(friend._id) &&
                            friend._id !== currentUserId
                        );
                      } else {
                        otherParticipant = (conversation.participants as User[]).find(
                          (p) => p._id !== currentUserId
                        );
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className={`m-2 cursor-pointer transition-all duration-300 ${
                            selectedUser?.clerkId === otherParticipant.clerkId
                              ? "bg-gradient-to-r from-zinc-800 to-zinc-700 ring-2 ring-zinc-600"
                              : "bg-zinc-800 hover:bg-zinc-700/75"
                          }`}
                          onClick={() => setSelectedUser(otherParticipant)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={otherParticipant.imageUrl} />
                                <AvatarFallback>{otherParticipant.fullName[0]}</AvatarFallback>
                              </Avatar>
                              <Badge
                                variant={
                                  onlineUsers.has(otherParticipant.clerkId)
                                    ? "default"
                                    : "secondary"
                                }
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full p-0 ${
                                  onlineUsers.has(otherParticipant.clerkId)
                                    ? "bg-green-500"
                                    : "bg-zinc-500"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-zinc-100 truncate break-words block">
                                {otherParticipant.fullName}
                              </span>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-sm text-zinc-400 truncate block">
                                  {previewText === "Image" ? (
                                    <p className="flex items-center justify-center gap-1">
                                      <Image className="w-4 h-4" />
                                      {previewText}
                                    </p>
                                  ) : (
                                    <>{previewText}</>
                                  )}
                                </span>
                                {timeText && (
                                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                                    {timeText}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </motion.div>
  );
};

export default memo(UsersList);