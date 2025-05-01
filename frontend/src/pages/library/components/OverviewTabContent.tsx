import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import debounce from "lodash/debounce"; // Đảm bảo đã cài đặt lodash
import { Link } from "react-router-dom";

const OverviewTabContent = () => {
  const {
    playlists,
    fetchPlaylists,
    favorites,
    fetchUserFavorites,
    playHistory,
    fetchPlayHistoryByUser,
    albums,
    fetchAlbums,
  } = useMusicStore();
  const { info } = useChatStore(); // Lấy userId từ useChatStore
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    if (info?._id) {
      fetchPlaylists();
      fetchUserFavorites(info._id);
      fetchPlayHistoryByUser(info._id);
      fetchAlbums();
    }
  }, [
    fetchPlaylists,
    fetchUserFavorites,
    fetchPlayHistoryByUser,
    fetchAlbums,
    info,
  ]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300), // 300ms delay
    []
  );

  // Lọc dữ liệu dựa trên search term
  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredFavorites = favorites.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPlayHistory = playHistory.filter((history) =>
    history.track_id.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-zinc-800/90 hover:shadow-lg transition-shadow rounded-xl">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="px-2 font-outfit">
            Your Library Overview
          </CardTitle>
          <div className="flex items-center justify-center gap-5">
            <Input
              type="search"
              placeholder="Search your library..."
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-sm border-sky-900 focus:ring-sky-500 focus:border-sky-500 w-72"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-2 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        {/* Playlists Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {filteredPlaylists.length > 0 ? (
              filteredPlaylists.slice(0, 6).map((playlist) => (
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
                    <Link to={`/playlists/${playlist._id}`} className="truncate">
                      <h3 className="font-medium text-lg text-white mb-1 truncate">
                        {playlist.title}
                      </h3>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-zinc-400 col-span-full">No playlists found.</p>
            )}
          </div>
        </section>

        {/* Likes Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Liked Tracks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {filteredFavorites.length > 0 ? (
              filteredFavorites.slice(0, 6).map((song) => (
                <Card
                  key={song._id}
                  className="rounded-xl hover:bg-zinc-700/50 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105 group cursor-pointer"
                >
                  <CardContent className="p-5">
                    <div className="relative mb-4">
                      <div className="absolute top-2 left-2 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                        Song
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                        <img
                          src={song.imageUrl || "/default-song.jpeg"}
                          alt={song.title}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                      </div>
                    </div>
                    <Link to={`/songs/${song._id}`} className="truncate">
                    <h3 className="font-medium text-lg text-white mb-1 truncate">
                      {song.title}
                    </h3></Link>
                    <p className="text-sm text-zinc-400 truncate">
                      {song.artists[0]?.name || "Unknown Artist"}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-zinc-400 col-span-full">
                No liked tracks found.
              </p>
            )}
          </div>
        </section>

        {/* History Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recently Played
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {filteredPlayHistory.length > 0 ? (
              filteredPlayHistory.slice(0, 6).map((history) => (
                <Card
                  key={history._id}
                  className="rounded-xl hover:bg-zinc-700/50 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105 group cursor-pointer"
                >
                  <CardContent className="p-5">
                    <div className="relative mb-4">
                      <div className="absolute top-2 left-2 bg-cyan-700/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                        History
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                        <img
                          src={
                            history.track_id.imageUrl || "/default-song.jpeg"
                          }
                          alt={history.track_id.title}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                      </div>
                    </div>
                    <Link to={`/songs/${history.track_id._id}`} className="truncate">
                    <h3 className="font-medium text-lg text-white mb-1 truncate">
                      {history.track_id.title}
                    </h3></Link>
                    <p className="text-sm text-zinc-400 truncate">
                      {history.source}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-zinc-400 col-span-full">
                No recently played tracks found.
              </p>
            )}
          </div>
        </section>

        {/* Albums Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {filteredAlbums.length > 0 ? (
              filteredAlbums.slice(0, 6).map((album) => (
                <Card
                  key={album._id}
                  className="rounded-xl hover:bg-zinc-700/50 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105 group cursor-pointer"
                >
                  <CardContent className="p-5">
                    <div className="relative mb-4">
                      <div className="absolute top-2 left-2 bg-rose-500/90 text-white text-xs px-2 py-1 rounded-md font-outfit">
                        Album
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                        <img
                          src={album.imageUrl || "/default-album.jpeg"}
                          alt={album.title}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                      </div>
                    </div><Link to={`/albums/${album._id}`} className="truncate">
                    <h3 className="font-medium text-lg text-white mb-1 truncate">
                      {album.title}
                    </h3></Link>
                    <Link to={`/artists/${album.artist?._id}`} className="truncate">
                    <p className="text-sm text-zinc-400 truncate">
                      {album.artist?.name || "Unknown Artist"}
                    </p></Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-zinc-400 col-span-full">No albums found.</p>
            )}
          </div>
        </section>

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

export default OverviewTabContent;
