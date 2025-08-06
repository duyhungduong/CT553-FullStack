import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Music } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { debounce } from "lodash";
import AddSongDialog from "./components/AddSongDialog";
import SearchSongsTable from "./components/SearchSongsTable";
import SongsTable from "./components/SongsTable";

const SongsTabContent = () => {
  const { fetchSearchSongs, searchResults } = useMusicStore();
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = debounce((query: string) => {
    fetchSearchSongs(query, 1, 20);
  }, 200);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <Card className="bg-zinc-800/60 border border-zinc-700 hover:shadow-lg transition-shadow rounded-xl">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div>
            <CardTitle className="flex items-center gap-3">
              <Music className="size-6 text-emerald-500 transition-transform duration-300 hover:scale-110" />
              <span className="text-xl font-semibold text-white">
                Songs Library
              </span>
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Manage your music tracks
            </CardDescription>
          </div>

          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-64 bg-zinc-900 text-white border-zinc-700 focus:ring-emerald-500"
            />
            <AddSongDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        {searchQuery && searchResults.length > 0 ? (
          <SearchSongsTable searchQuery={searchQuery} />
        ) : (
          <SongsTable />
        )}
      </CardContent>
    </Card>
  );
};

export default SongsTabContent;