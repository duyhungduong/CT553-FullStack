import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import debounce from "lodash/debounce"; // Import debounce with type support
import { Link } from "react-router-dom";
import AddPlaylistDialog from "@/pages/song/components/CreatePlaylistDialog";

const PlaylistTabContent = () => {
  const { playlists, fetchPlaylists } = useMusicStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch playlists on mount
  useEffect(() => {
    fetchPlaylists(1, 100);
  }, [fetchPlaylists]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300), // 300ms delay
    []
  );

  // Filter playlists based on search term
  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("All playlists:", playlists);
  console.log("Filtered playlists:", filteredPlaylists);

  return (
    <Card className="bg-zinc-800/90 hover:shadow-lg transition-shadow rounded-xl">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="px-2">
            Hear your own playlists and the playlists you’ve liked:
          </CardTitle>
          <div className="flex items-center justify-center gap-5">
            <Input
              type="search"
              placeholder="Search playlists..."
              onChange={(e) => handleSearch(e.target.value)} // Use debounced handler
              className="rounded-sm border-sky-900 focus:ring-sky-500 focus:border-sky-500"
            />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue defaultValue={"all"} placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="liked">Liked</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-2 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        {/* <AddPlaylistSheet /> */}
        <AddPlaylistDialog/>
        {/* Display filtered playlists */}
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {filteredPlaylists.length > 0 ? (
            filteredPlaylists.map((playlist) => (
              <Card
                key={playlist._id}
                className="rounded-xl hover:bg-zinc-700/50 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105 group cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="relative mb-4">
                    
                      <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                        Playlist
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                        <img
                          src={playlist.imageUrl || "/default-playlist.jpeg"}
                          alt={playlist.title}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                      </div>
                  </div>
                  <Link to={`/playlists/${playlist._id}`} className="font-medium text-lg text-white mb-1 truncate">
                    {playlist.title}
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-zinc-400 col-span-full text-center">
              No playlists found matching your search.
            </p>
          )}
        </div>
        <Separator className="my-4" />
        <span className="text-xs truncate">
          Legal ⁃ Privacy ⁃ Cookie Policy ⁃ Cookie Manager ⁃ Imprint ⁃ Artist
          Resources ⁃ Blog ⁃ Charts ⁃ Transparency Reports
        </span>
        <p className="text-xs">Language: English (US)</p>
      </CardContent>
    </Card>
  );
};

export default PlaylistTabContent;