import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "./components/Header";
import { History, ListMusic, Shuffle, Trash2 } from "lucide-react";

import QueuesTabContent from "./components/QueuesTabContent";
import RecentsTabContent from "./components/RecentsTabContent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useChatStore } from "@/stores/useChatStore";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const QueuePage = () => {
  const { shuffleQueue, clearQueue } = usePlayerStore();
  const { info } = useChatStore();

  const {userId} = useAuth();

  // console.log("info", info);
  const handleClearQueue = async () => {
    if (info?._id) {
      await clearQueue(userId || "");
    }
  };
  return (
    <main className="h-full w-full bg-zinc-900 text-white">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-zinc-700 bg-zinc-800/80 p-4 backdrop-blur-md">
        <SidebarTrigger className="-ml-1 text-zinc-300 hover:text-white" />
        <Separator orientation="vertical" className="h-6 bg-zinc-700" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-300">
            <BreadcrumbItem>
              <BreadcrumbLink
                // href="/"
                className="hover:text-sky-400 transition-colors"
              >
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
            <BreadcrumbItem>
              <BreadcrumbLink
                // href="/queue"
                className="hover:text-sky-400 transition-colors"
              >
                <Link to={"/queue"}>Queue</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-500" />
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <Header />
      <ScrollArea className="h-[calc(100vh-220px)] mt-4">
        <Tabs defaultValue="queue" className="space-y-6 mt-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="p-1 bg-zinc-800/50">
              <TabsTrigger
                value="queue"
                className="data-[state=active]:bg-zinc-700 rounded-sm p-3 transition-all duration-200 mr-1"
              >
                <ListMusic className="mr-2 h-4 w-4" />
                Danh sách chờ
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-zinc-700 rounded-sm p-3 transition-all duration-200"
              >
                <History className="mr-2 h-4 w-4" />
                Đã phát gần đây
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shuffleQueue}
                className="flex items-center gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearQueue}
                className="flex items-center gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
                Clear Queue
              </Button>
            </div>
          </div>
          <TabsContent value="queue">
            <QueuesTabContent />
          </TabsContent>
          <TabsContent value="history">
            <RecentsTabContent />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </main>
  );
};

export default QueuePage;
