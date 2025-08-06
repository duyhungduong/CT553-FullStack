import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { axiosInstance } from "@/lib/axios";
import { useChatStore } from "@/stores/useChatStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PlayButton from "./components/PlayButton";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const moods = [
  "peaceful",
  "relaxing",
  "melancholic",
  "romantic",
  "uplifting",
  "energetic",
  "dramatic",
  "mysterious",
  "triumphant",
  "ethereal",
  "contemplative",
  "hopeful",
];

const tempos = ["80", "100", "120", "140", "160"];

const SearchPage = () => {
  const { info, fetchInfo } = useChatStore();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    recommendations,
    fetchRecommendations,
    isLoadingRecommendations,
  } = useSearchStore();

  const [mood, setMood] = useState("");
  const [tempo, setTempo] = useState("");

  useEffect(() => {
    fetchInfo();
    if (info?._id) {
      const queryParams: { [key: string]: string } = {};
      if (mood) queryParams.mood = mood;
      if (tempo) queryParams.tempo = tempo;
      fetchRecommendations(info._id, queryParams);
    }
  }, [info?._id, fetchInfo, fetchRecommendations, mood, tempo]);

  // Thêm useEffect mới để tự động tìm kiếm khi mood/tempo thay đổi
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }
  }, [mood, tempo, searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const queryParams: { [key: string]: string } = {
        q: encodeURIComponent(searchQuery),
      };
      if (mood) queryParams.mood = mood;
      if (tempo) queryParams.tempo = tempo;

      const response = await axiosInstance.get(`/search`, {
        params: queryParams,
      });
      setSearchResults({
        songs: response.data.results.songs || [],
        artists: response.data.results.artists || [],
        albums: response.data.results.albums || [],
      });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ songs: [], artists: [], albums: [] });
    }
  };

  const userId = info?._id || "";
  const userRecommendations = recommendations[userId] || {
    itemBased: [],
    userBased: [],
    knowledgeBased: [],
    utilityBased: [],
    demographicBased: [],
    contentBased: [],
    collaborativeUser: [],
    hybrid: [],
    matrixFactorization: [],
  };

  const renderRecommendationSection = (title: string, songs: any[]) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((item) => (
          <Card
            key={item._id}
            className="relative flex items-center rounded-lg overflow-hidden bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200 group"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-16 h-16 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/songs/${item._id}`}
                  className="text-white text-lg truncate hover:underline hover:text-sky-400 transition-colors duration-200"
                >
                  {item.title}
                </Link>
                <Link to={`/artists/${item.artists[0]?._id || ""}`}>
                  <p className="text-zinc-400 text-sm truncate hover:underline hover:text-sky-400 transition-colors duration-200">
                    {item.artists[0]?.name}
                  </p>
                </Link>
              </div>
              <PlayButton song={item} songs={songs} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-4 border-b border-zinc-700 bg-zinc-800/80 p-4 backdrop-blur-sm">
        <SidebarTrigger className="-ml-1 text-zinc-300 hover:text-white" />
        <Separator orientation="vertical" className="h-6 bg-zinc-600" />
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
                <Link to={"/search"}>Search</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {searchQuery && (
              <>
                <BreadcrumbSeparator className="text-zinc-500" />
                <BreadcrumbItem>
                  <span className="text-white truncate max-w-[200px]">
                    {searchQuery}
                  </span>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6">
        <form
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto space-y-4"
        >
          <div className="relative">
            <Input
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400 py-6 text-lg rounded-full pr-12 focus:ring-2 focus:ring-sky-500"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-4">
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue placeholder="Select Mood" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tempo} onValueChange={setTempo}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue placeholder="Select Tempo" />
              </SelectTrigger>
              <SelectContent>
                {tempos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} BPM
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>

      <ScrollArea className="h-[calc(100vh-290px)]">
        <div className="p-6 space-y-8">
          {isLoadingRecommendations ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full bg-zinc-800/50 rounded-lg"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Search Results */}
              {searchQuery && (
                <>
                  {searchResults.songs.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold text-white">Songs</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.songs.map((song) => (
                          <Card
                            key={song._id}
                            className="relative flex items-center rounded-lg overflow-hidden bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200 group"
                          >
                            <CardContent className="p-4 flex items-center gap-4">
                              <img
                                src={song.imageUrl}
                                alt={song.title}
                                className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/songs/${song._id}`}
                                  className="text-white text-lg truncate"
                                >
                                  {song.title}
                                </Link>
                                <Link
                                  to={`/artists/${
                                    song.artists?.[0]?._id || ""
                                  }`}
                                >
                                  <p className="text-zinc-400 text-sm truncate">
                                    {song.artists[0]?.name}
                                  </p>
                                </Link>
                              </div>
                              <PlayButton
                                song={song}
                                songs={searchResults.songs}
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                  {searchResults.artists.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold text-white">Artists</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.artists.map((artist) => (
                          <Card
                            key={artist._id}
                            className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200 group"
                          >
                            <CardContent className="p-4 flex items-center gap-4">
                              <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                              />
                              <Link to={`/artists/${artist._id}`}>
                                <p className="text-white text-lg truncate">
                                  {artist.name}
                                </p>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                  {searchResults.albums.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold text-white">Albums</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.albums.map((album) => (
                          <Card
                            key={album._id}
                            className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200 group"
                          >
                            <CardContent className="p-4 flex items-center gap-4">
                              <img
                                src={album.imageUrl}
                                alt={album.title}
                                className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/albums/${album._id}`}
                                  className="text-white text-lg truncate"
                                >
                                  {album.title}
                                </Link>
                                <Link to={`/artists/${album.artistId}`}>
                                  <p className="text-zinc-400 text-sm truncate">
                                    {album.artist}
                                  </p>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                  {searchResults.songs.length === 0 &&
                    searchResults.artists.length === 0 &&
                    searchResults.albums.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-zinc-400 text-lg">
                          No results found for "{searchQuery}"
                        </p>
                        <p className="text-zinc-500">
                          Try a different search term
                        </p>
                      </div>
                    )}
                </>
              )}

              {/* Recommendations khi không có search query */}
              {!searchQuery && (
                <Tabs defaultValue="item-based" className="space-y-4">
                  <TabsList className="flex flex-wrap gap-2 bg-zinc-800/50 p-2 rounded-lg">
                    {userRecommendations.itemBased.length > 0 && (
                      <TabsTrigger
                        value="item-based"
                        className="text-zinc-300 hover:text-white"
                      >
                        {/* Item-based */}
                        Songs You Might Like
                      </TabsTrigger>
                    )}
                    {userRecommendations.userBased.length > 0 && (
                      <TabsTrigger
                        value="user-based"
                        className="text-zinc-300 hover:text-white"
                      >
                        {/* User-based */}
                        Inspired by Similar Listeners
                      </TabsTrigger>
                    )}
                    {userRecommendations.knowledgeBased.length > 0 && (
                      <>
                      </>
                      // <TabsTrigger
                      //   value="knowledge-based"
                      //   className="text-zinc-300 hover:text-white"
                      // >
                      //   {/* Knowledge-based */}
                      //   Tailored to Your Taste
                      // </TabsTrigger>
                    )}
                    {userRecommendations.utilityBased.length > 0 && (
                      <TabsTrigger
                        value="utility-based"
                        className="text-zinc-300 hover:text-white"
                      >
                        {/* Utility-based */}
                        Top Picks for You
                      </TabsTrigger>
                    )}
                    {userRecommendations.demographicBased.length > 0 && (
                      <>
                      </>
                      // <TabsTrigger
                      //   value="demographic-based"
                      //   className="text-zinc-300 hover:text-white"
                      // >
                      //   {/* Demographic-based */}
                      //   Trending Near You
                      // </TabsTrigger>
                    )}
                    {userRecommendations.contentBased.length > 0 && (
                      <TabsTrigger
                        value="content-based"
                        className="text-zinc-300 hover:text-white"
                      >
                        {/* Content-based */}
                        Echoes of Your Playlist
                      </TabsTrigger>
                    )}
                    {userRecommendations.collaborativeUser.length > 0 && (
                      <TabsTrigger
                        value="collaborative-user"
                        className="text-zinc-300 hover:text-white"
                      >
                        {/* Collaborative User */}
                        Friends’ Favorites
                      </TabsTrigger>
                    )}
                    {userRecommendations.hybrid.length > 0 && (
                      <TabsTrigger
                        value="hybrid"
                        className="text-zinc-300 hover:text-white"
                      >
                        {/* Hybrid */}
                        Hidden Gems
                      </TabsTrigger>
                    )}
                    {userRecommendations.matrixFactorization.length > 0 && (
                      <TabsTrigger
                        value="matrix-factorization"
                        className="text-zinc-300 hover:text-white"
                      >
                        Matrix Factorization
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {Object.values(userRecommendations).every(
                    (recs) => recs.length === 0
                  ) ? (
                    <div className="text-center py-12">
                      <p className="text-zinc-400 text-lg">
                        No recommendations available yet
                      </p>
                      <p className="text-zinc-500">
                        Start listening to get personalized suggestions!
                      </p>
                      <Link
                        to="/songs"
                        className="text-sky-400 hover:underline"
                      >
                        Explore Popular Songs
                      </Link>
                    </div>
                  ) : (
                    <>
                      <TabsContent value="item-based">
                        {renderRecommendationSection(
                          "Recommended for You",
                          userRecommendations.itemBased
                        )}
                      </TabsContent>
                      <TabsContent value="user-based">
                        {renderRecommendationSection(
                          "Based on Your Taste",
                          userRecommendations.userBased
                        )}
                      </TabsContent>
                      {/* <TabsContent value="knowledge-based">
                        {renderRecommendationSection(
                          "Based on Your Preferences (Knowledge-based)",
                          userRecommendations.knowledgeBased
                        )}
                      </TabsContent> */}
                      <TabsContent value="utility-based">
                        {renderRecommendationSection(
                          "Top Picks for You",
                          userRecommendations.utilityBased
                        )}
                      </TabsContent>
                      {/* <TabsContent value="demographic-based">
                        {renderRecommendationSection(
                          "Popular in Your Region (Demographic-based)",
                          userRecommendations.demographicBased
                        )}
                      </TabsContent> */}
                      <TabsContent value="content-based">
                        {renderRecommendationSection(
                          "Similar to Your Favorites",
                          userRecommendations.contentBased
                        )}
                      </TabsContent>
                      <TabsContent value="collaborative-user">
                        {renderRecommendationSection(
                          "From Similar Listeners (Collaborative User)",
                          userRecommendations.collaborativeUser
                        )}
                      </TabsContent>
                      <TabsContent value="hybrid">
                        {renderRecommendationSection(
                          "Best of Both Worlds",
                          userRecommendations.hybrid
                        )}
                      </TabsContent>
                      <TabsContent value="matrix-factorization">
                        {renderRecommendationSection(
                          "Advanced Suggestions (Matrix Factorization)",
                          userRecommendations.matrixFactorization
                        )}
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchPage;
