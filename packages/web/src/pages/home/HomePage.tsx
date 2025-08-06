import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState, useMemo } from "react";
import FeaturedSection from "./components/FeaturedSection";
import SectionGrid from "./components/SectionGrid";
import { ScrollArea } from "@/components/ui/scroll-area";
import ArtistSectionGrid from "./components/ArtistSectionGrid";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import SectionAlbumGrid from "./components/SectionAlbumGrid";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { KeyRound, Pause, Play } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { Playlist, Song } from "@/types";
import PlaylistSection from "./components/PlaylistSection";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { extractColors } from "extract-colors";
import { usePlayerStore } from "@/stores/usePlayerStore";

const shuffleArray = (array: Song[]): Song[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const HomePage = () => {
  const {
    albums,
    artists,
    isLoading,
    recentSongs,
    trendingSongs,
    featuredSongs,
    playlists,
    genres,
    instruments,
    fetchGenres,
    fetchInstruments,
    preloadHomePageData,
  } = useMusicStore();

  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    togglePlay,
    initializeQueue,
  } = usePlayerStore();

  const {
    fetchRecommendations,
    isLoadingRecommendations,
    recommendations,
    setIsLoadingRecommendations,
  } = useSearchStore();

  const { info } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const { fetchUsers, initSocket } = useChatStore();
  const { user } = useUser();
  const [dailyMixes, setDailyMixes] = useState<Playlist[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Optimize: Combine related effects and add loading state
  useEffect(() => {
    const initializeHomePage = async () => {
      setIsInitializing(true);
      
      // Batch these calls to reduce re-renders
      await Promise.all([
        fetchGenres(),
        fetchInstruments(),
      ]);

      if (user) {
        fetchUsers();
        initSocket(user.id);
      }

      setIsInitializing(false);
    };

    initializeHomePage();

    return () => {
      useChatStore.getState().disconnectSocket();
    };
  }, [fetchGenres, fetchInstruments, fetchUsers, initSocket, user]);

  // Separate effect for user-specific data
  useEffect(() => {
    if (isInitializing) return;
    
    const userId = info?._id || "";
    if (userId) {
      preloadHomePageData(userId);
      // Debounce recommendation fetching
      const timeoutId = setTimeout(() => {
        fetchRecommendations(userId);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsLoadingRecommendations(false);
    }
  }, [info, preloadHomePageData, fetchRecommendations, setIsLoadingRecommendations, isInitializing]);

  const userId = info?._id || "";
  
  // Memoize user recommendations to prevent unnecessary re-renders
  const userRecommendations = useMemo(() => {
    return recommendations[userId] || {
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
  }, [recommendations, userId]);

  const featuredSongsData = useMemo(() => {
    if (userRecommendations.itemBased.length > 0) {
      return userRecommendations.itemBased;
    } else if (userRecommendations.userBased.length > 0) {
      return userRecommendations.userBased;
    }
    return featuredSongs;
  }, [userRecommendations.itemBased, userRecommendations.userBased, featuredSongs]);

  // Optimize Daily Mixes generation with better async handling
  useEffect(() => {
    if (isInitializing || !userId) return;

    const generateDailyMixes = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const storedMixes = JSON.parse(
          localStorage.getItem("dailyMixes") || "[]"
        );

        if (storedMixes.length > 0 && storedMixes[0].createdAt === today) {
          setDailyMixes(storedMixes);
          return;
        }

        // Optimize: Generate mix image without blocking
        const generateMixImage = async (tracks: Song[]): Promise<string> => {
          if (tracks.length === 0) return "/default-mix.jpg";
          
          try {
            const firstSongImage = tracks[0].imageUrl || "/default-song.jpg";
            const colors = await Promise.race([
              extractColors(firstSongImage),
              new Promise<any[]>((resolve) => setTimeout(() => resolve([{ hex: "#666666" }]), 2000))
            ]);
            
            return colors.length >= 2
              ? `linear-gradient(135deg, ${colors[0].hex}, ${colors[1].hex})`
              : colors[0]?.hex || "/default-mix.jpg";
          } catch (error) {
            console.warn("Failed to extract colors:", error);
            return "/default-mix.jpg";
          }
        };

        const mixConfigs = [
          { id: "daily-mix-1", title: "Daily Mix 1", tracks: userRecommendations.itemBased.slice(0, 15), desc: "A mix of songs based on your favorites, refreshed daily." },
          { id: "daily-mix-2", title: "Daily Mix 2", tracks: userRecommendations.userBased.slice(0, 12), desc: "Songs inspired by listeners like you, updated daily." },
          { id: "daily-mix-3", title: "Daily Mix 3", tracks: userRecommendations.knowledgeBased.slice(0, 10), desc: "Curated for your mood, refreshed every day." },
          { id: "daily-mix-4", title: "Daily Mix 4", tracks: userRecommendations.hybrid.slice(0, 10), desc: "The best of everything, mixed daily just for you." },
          { id: "daily-mix-5", title: "Daily Mix 5", tracks: userRecommendations.demographicBased.slice(0, 10), desc: "Hits from your region, updated daily." },
        ];

        // Generate mixes in parallel but limit concurrency
        const mixes: Playlist[] = await Promise.all(
          mixConfigs.map(async (config) => ({
            _id: config.id,
            title: config.title,
            imageUrl: await generateMixImage(config.tracks),
            tracks: shuffleArray(config.tracks),
            total_tracks: config.tracks.length,
            userId: userId,
            user: {
              _id: userId,
              name: "Daily Mix",
              imageUrl: "/default-user.jpg",
            },
            description: config.desc,
            createdAt: today,
            updatedAt: today,
            isPublic: false,
            artist: { _id: "daily-mix-artist", name: "Various Artists" },
            genres: [],
          }))
        );

        const filteredMixes = mixes.filter(
          (mix) => (mix.tracks?.length ?? 0) > 0
        );
        
        setDailyMixes(filteredMixes);
        
        // Use requestIdleCallback for localStorage to avoid blocking
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            localStorage.setItem("dailyMixes", JSON.stringify(filteredMixes));
          });
        } else {
          setTimeout(() => {
            localStorage.setItem("dailyMixes", JSON.stringify(filteredMixes));
          }, 0);
        }
      } catch (error) {
        console.error("Failed to generate daily mixes:", error);
      }
    };

    generateDailyMixes();
  }, [userRecommendations, userId, isInitializing]);

  const shuffledFeaturedSongs = useMemo(() => {
    return shuffleArray(featuredSongsData.slice(0, 18));
  }, [featuredSongsData]);

  const filterSongs = (songs: Song[]) =>
    songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handlePlay = async (song: Song, songs: Song[]) => {
    const isCurrentSong = currentSong?._id === song._id;
    if (isCurrentSong) {
      togglePlay(info?.clerkId || "");
    } else {
      setCurrentSong(song, info?.clerkId || "");
      initializeQueue(songs, info?.clerkId || "", true);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  // Show loading state while initializing to prevent heavy renders
  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
        <div className="flex items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <span className="text-lg">Loading MelodicBook...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="overflow-hidden h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black"
    >
      {/* Header */}
      <motion.header
        variants={headerVariants}
        className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-lg shadow-md"
      >
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
          <Separator orientation="vertical" className="h-6 bg-zinc-700" />
          <Breadcrumb>
            <BreadcrumbList className="text-zinc-300">
              <BreadcrumbItem>
                <BreadcrumbLink className="hover:text-sky-400 transition-colors">
                  <Link to={"/"}>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-4">
          <motion.div variants={itemVariants}>
            <Input
              placeholder="Search songs, albums, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 bg-zinc-800/50 border-zinc-700 text-white rounded-full focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
            />
          </motion.div>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                  userButtonPopoverCard:
                    "bg-zinc-800 shadow-lg border border-zinc-700",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <Link to={"/login"}>
              <Button className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white transition-all duration-300">
                <KeyRound className="" size={16} />
                Login
              </Button>
            </Link>
          </SignedOut>
        </div>
      </motion.header>

      <ScrollArea className="h-[calc(100vh-134px)]">
        {/* Hero Section */}
        <motion.section
          variants={heroVariants}
          className="relative h-[35vh] flex items-center justify-center bg-gradient-to-br from-sky-500/20 via-zinc-900 to-black"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          <motion.div
            variants={containerVariants}
            className="relative z-10 text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg font-outfit"
            >
              <TypeAnimation
                className="font-sans"
                sequence={[
                  "Welcome back,",
                  200,
                  `Welcome back, ${info?.fullName || "my friends"}`,
                ]}
              />
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-2 text-lg text-zinc-300"
            >
              Discover your favorite music today
            </motion.p>
            {shuffledFeaturedSongs[0] && (
              <motion.div variants={itemVariants} className="mt-4">
                <Button
                  onClick={() =>
                    handlePlay(shuffledFeaturedSongs[0], shuffledFeaturedSongs)
                  }
                  className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-2"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-white transition-all duration-200" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-white transition-all duration-200" />
                  )}
                  <TypeAnimation sequence={["Play now!", 200]} />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.section>

        {/* Main Content */}
        <motion.div variants={containerVariants} className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence>
            <motion.div variants={containerVariants} className="space-y-12">
              <motion.div variants={itemVariants}>
                <PlaylistSection
                  title="Public Playlists"
                  playlists={playlists}
                  isLoading={isLoading}
                  itemsPerPage={6}
                />
              </motion.div>
            </motion.div>

            <motion.section variants={itemVariants} className="my-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold mb-6 text-white">Genres</h2>
                <Button
                  variant="link"
                  className="text-sm text-zinc-400 hover:text-sky-500 transition-colors duration-200"
                  asChild
                >
                  <Link to="/genres">Show all</Link>
                </Button>
              </div>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {genres.slice(0, 6).map((genre) => (
                  <motion.div key={genre._id} variants={itemVariants}>
                    <Link
                      to={`/genres/${genre._id}`}
                      className="relative h-60 rounded-xl overflow-hidden group shadow-lg"
                    >
                      <img
                        src={
                          genre.imageUrl || "https://via.placeholder.com/400"
                        }
                        alt={genre.name}
                        className="w-full h-60 object-cover brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xl font-bold drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                          {genre.name}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            <motion.div variants={containerVariants} className="space-y-12">
              <motion.div variants={itemVariants}>
                <SectionGrid
                  title="New Songs"
                  songs={filterSongs(recentSongs)}
                  isLoading={isLoading}
                />
              </motion.div>
            </motion.div>

            <motion.div variants={containerVariants} className="space-y-12">
              <motion.div variants={itemVariants}>
                <SectionAlbumGrid
                  title="Albums"
                  albums={albums.filter((album) =>
                    album.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FeaturedSection
                  title="Recommended for You"
                  songs={filterSongs(shuffledFeaturedSongs)}
                  isLoading={isLoadingRecommendations}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <PlaylistSection
                  title="Daily Mixes"
                  playlists={dailyMixes}
                  isLoading={isLoadingRecommendations}
                  itemsPerPage={5}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <SectionGrid
                  title="Trending"
                  songs={filterSongs(trendingSongs)}
                  isLoading={isLoading}
                />
              </motion.div>
            </motion.div>

            <motion.section variants={itemVariants} className="my-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold mb-6 text-white">
                Musical instruments
              </h2>
              <Button
                  variant="link"
                  className="text-sm text-zinc-400 hover:text-sky-500 transition-colors duration-200"
                  asChild
                >
                  <Link to="/instruments">Show all</Link>
                </Button>
            </div>
              
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {instruments.slice(0, 6).map((instrument) => (
                  <motion.div key={instrument._id} variants={itemVariants}>
                    <Link
                      to={`/instruments/${instrument._id}`}
                      className="relative h-60 rounded-xl overflow-hidden group shadow-lg"
                    >
                      <img
                        src={
                          instrument.imageUrl ||
                          "https://via.placeholder.com/400"
                        }
                        alt={instrument.name}
                        className="w-full h-60 object-cover brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xl font-bold drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                          {instrument.name}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            <motion.div variants={containerVariants} className="space-y-12">
              {userRecommendations.hybrid.length > 0 && (
                <motion.div variants={itemVariants}>
                  <SectionGrid
                    title="The Best Mix"
                    songs={filterSongs(userRecommendations.hybrid)}
                    isLoading={isLoadingRecommendations}
                  />
                </motion.div>
              )}
              {userRecommendations.demographicBased.length > 0 && (
                <motion.div variants={itemVariants}>
                  <SectionGrid
                    title="Local Hits"
                    songs={filterSongs(userRecommendations.demographicBased)}
                    isLoading={isLoadingRecommendations}
                  />
                </motion.div>
              )}
              {userRecommendations.userBased.length > 0 && (
                <motion.div variants={itemVariants}>
                  <SectionGrid
                    title="Made For You"
                    songs={filterSongs(userRecommendations.userBased)}
                    isLoading={isLoading}
                  />
                </motion.div>
              )}
              {userRecommendations.knowledgeBased.length > 0 && (
                <motion.div variants={itemVariants}>
                  <SectionGrid
                    title="Mood of the Day"
                    songs={filterSongs(userRecommendations.knowledgeBased)}
                    isLoading={isLoadingRecommendations}
                  />
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <ArtistSectionGrid
                  title="Featured Artists"
                  artists={artists.filter((artist) =>
                    artist.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </ScrollArea>
    </motion.main>
  );
};

export default HomePage;
