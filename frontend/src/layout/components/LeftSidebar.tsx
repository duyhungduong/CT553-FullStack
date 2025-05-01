import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeletons";
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { SignedIn } from "@clerk/clerk-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { HomeIcon, Library, MessageCircle, Search } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
  const { albums, fetchAlbums, isLoading } = useMusicStore();

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);
  console.log({ albums });
  return (
    <div className="h-full flex flex-col gap-2">
      {/* Navigation menu */}

      <div className="rounded-lg bg-zinc-900 p-4 flex-1">
        <div className="space-y-2 justify-center items-center">
          <Link
            to={"/"}
            title="Home Page"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-center text-white hover:bg-zinc-800",
              })
            )}
          >
            <HomeIcon className="size-7"/>
            {/* <span className="hidden md:inline">Home</span> */}
          </Link>

          <Link
            to={"/search"}
            title="Search Page"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-center text-white hover:bg-zinc-800",
              })
            )}
          >
            <Search className=" size-5" />
            {/* <span className="hidden md:inline">Search</span> */}
          </Link>

          <SignedIn>
            <Link
              to={"/chat"}
              title="Chat Page"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className:
                    "w-full justify-center text-white hover:bg-zinc-800",
                })
              )}
            >
              <MessageCircle className="size-5" />
              {/* <span className="hidden md:inline">Messages</span> */}
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Library section */}
      <div className="flex-1 rounded-lg bg-zinc-900 p-4 ">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center text-white px-1" title="Playlists">
            <Library className="size-5" />
            {/* <span className="hidden md:inline font-medium">Playlists</span> */}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)] flex justify-center">
          <div className="space-y-2">
            {isLoading ? (
              <PlaylistSkeleton />
            ) : (
              albums.map((album) => (
                <Link
                  to={`/albums/${album._id}`}
                  key={album._id}
                  className="  rounded-md flex items-center justify-center gap-3 group cursor-pointer group-hover:bg-zinc-800"
                  title={"Album: "+album.title}
                >
                  <img
                    src={album.imageUrl}
                    alt="Playlist img"
                    className="w-full h-full rounded-md flex-shrink-0 object-cover"
                  />

                  {/* <div className="flex-1 min-w-0 hidden md:block">
                    <p className="font-light text-sm truncate">{album.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-zinc-400 truncate">Album</p>{" "}
                      <AudioLines className="size-3" />
                      <p className="text-xs text-zinc-400 truncate">
                        {album.author.name}
                      </p>
                    </div>
                  </div> */}
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
export default LeftSidebar;
