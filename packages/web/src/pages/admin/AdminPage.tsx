import { useAuthStore } from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Album, Contact, Disc3, Guitar, MicVocal, Music } from "lucide-react";
import SongsTabContent from "./components/Song/SongsTabContent";
import AlbumsTabContent from "./components/Album/AlbumsTabContent";
import ArtistsTabContent from "./components/Artist/ArtistsTabContent";
import UserTabContent from "./components/User/UserTabContent";
import GenreTabContent from "./components/Genre/GenreTabContent";
import InstrumentTabContent from "./components/Instrument/InstrumentTabContent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { RadarChartComponent } from "./components/Chart/RadarChartComponent";
import { RadialChartComponent } from "./components/Chart/RadialChartComponent";
import AreaChartComponent from "./components/Chart/AreaChartComponent";
import BarChartComponent from "./components/Chart/BarChartComponent";
import { PieChartComponent } from "./components/Chart/PieChartComponent";
const AdminPage = () => {
  const { isAdmin, isLoading } = useAuthStore();
  const {
    fetchSongs,
    fetchAlbums,
    fetchStats,
    fetchArtists,
    fetchGenres,
    fetchInstruments,
    songsPerPage,
  } = useMusicStore();
  const [activeTab, setActiveTab] = useState("songs");

  useEffect(() => {
    const loadInitialData = async () => {
      if (isAdmin) {
        await Promise.all([
          fetchSongs(1, songsPerPage),
          fetchGenres(),
          fetchInstruments(),
          fetchArtists(),
          fetchAlbums(),
          fetchStats(),
        ]);
      }
    };
    if (!isLoading) {
      loadInitialData();
    }
  }, [
    isAdmin,
    isLoading,
    fetchSongs,
    fetchGenres,
    fetchInstruments,
    fetchArtists,
    fetchAlbums,
    fetchStats,
    songsPerPage,
  ]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  const handleTabChange = (
    tabValue: "songs" | "albums" | "artists" | "users" | "genres" | "instruments"
  ) => {
    setActiveTab(tabValue);
  };

  return (
    <div>
      <ScrollArea
        className="h-screen min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 px-8 py-4"
      >
        <Header />

        {/* Thay thế Chart cũ bằng AreaChartComponent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3"
        >
          <AreaChartComponent />
        </motion.div>

        {/* Khu vực các biểu đồ khác */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6"
        >
          <BarChartComponent />
          <RadarChartComponent />
          <RadialChartComponent />
          <PieChartComponent/>
        </motion.div>

        <DashboardStats onTabChange={handleTabChange} />
        <Tabs
          defaultValue="songs"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="p-1 bg-zinc-900/80 shadow-lg border border-zinc-700/50 backdrop-blur-lg sticky top-0 z-10">
            <TabsTrigger value="songs" className="data-[state=active]:bg-zinc-700">
              <Music className="mr-2 size-4" />
              Songs
            </TabsTrigger>
            <TabsTrigger value="albums" className="data-[state=active]:bg-zinc-700">
              <Album className="mr-2 size-4" />
              Albums
            </TabsTrigger>
            <TabsTrigger value="artists" className="data-[state=active]:bg-zinc-700">
              <MicVocal className="mr-2 size-4" />
              Artist
            </TabsTrigger>
            <TabsTrigger value="genres" className="data-[state=active]:bg-zinc-700 hidden md:flex">
              <Disc3 className="mr-2 size-4" />
              Genres
            </TabsTrigger>
            <TabsTrigger value="instruments" className="data-[state=active]:bg-zinc-700 hidden md:flex">
              <Guitar className="mr-2 size-4" />
              Instruments
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-zinc-700">
              <Contact className="mr-2 size-4" />
              User
            </TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="songs">
                <SongsTabContent />
              </TabsContent>
              <TabsContent value="albums">
                <AlbumsTabContent />
              </TabsContent>
              <TabsContent value="genres">
                <GenreTabContent />
              </TabsContent>
              <TabsContent value="instruments">
                <InstrumentTabContent />
              </TabsContent>
              <TabsContent value="artists">
                <ArtistsTabContent />
              </TabsContent>
              <TabsContent value="users">
                <UserTabContent />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default AdminPage;