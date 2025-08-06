import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaylistTabContent from "./components/PlaylistTabContent";
import OverviewTabContent from "./components/OverviewTabContent";
import LikesTabContent from "./components/LikesTabContent";
import HistoryTabContent from "./components/HistoryTabContent";
import FollowsTabContent from "./components/FollowsTabContent";
import StationsTabContent from "./components/StationsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import { Link } from "react-router-dom";
import StickerTabContent from "./components/StickerTabContent";
const LibraryPage = () => {
  return (
    <div className="h-full overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-4 border-b border-zinc-700 bg-zinc-800/80 p-4 backdrop-blur-sm">
        <SidebarTrigger className="-ml-1 text-zinc-300 hover:text-white" />
        <Separator orientation="vertical" className="h-6 bg-zinc-600" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-300">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block text-zinc-500" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                <Link to={"/library"}>Library</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="p-4 sm:p-6">
          {/* <h1 className="mb-8 text-3xl font-bold tracking-tight text-white sm:text-4xl font-outfit">
              Good afternoon
            </h1> */}
          <Tabs
            defaultValue="likes"
            className="space-y-6 mt-1 flex flex-col"
          >
            <TabsList className="flex justify-start p-6 bg-zinc-800/70 rounded-none shrink-0 border-b-2 border-zinc-700 shadow-none mb-1">
              <TabsTrigger
                value="overview"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="likes"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                Likes
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                Playlists
              </TabsTrigger>
              <TabsTrigger
                value="sticker"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                Sticker
              </TabsTrigger>
              <TabsTrigger
                value="albums"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                Albums
              </TabsTrigger>
              <TabsTrigger
                value="stations"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                Stations
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                Following
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex cursor-default select-none py-4 px-7 rounded-none items-center justify-center text-lg leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:focus:relative data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-zinc-800/70"
              >
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="">
              <OverviewTabContent />
            </TabsContent>
            <TabsContent value="likes">
              <LikesTabContent />
            </TabsContent>
            <TabsContent value="playlists">
              <PlaylistTabContent />
            </TabsContent>
            <TabsContent value="sticker">
              <StickerTabContent />
            </TabsContent>
            <TabsContent value="albums">
              <AlbumsTabContent />
            </TabsContent>
            <TabsContent value="stations">
              <StationsTabContent />
            </TabsContent>
            <TabsContent value="following">
              <FollowsTabContent />
            </TabsContent>
            <TabsContent value="history">
              <HistoryTabContent />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LibraryPage;
