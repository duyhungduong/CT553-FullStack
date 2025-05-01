import { useMusicStore } from "@/stores/useMusicStore";
import {
  Disc,
  DiscAlbum,
  Guitar,
  Palette,
  Piano,
  Users,
} from "lucide-react";
import StatsCard from "./StatsCard";

type DashboardStatsProps = {
  onTabChange: (tabValue: "songs" | "albums" | "artists" | "users") => void; // Thêm kiểu rõ ràng
};

const DashboardStats = ({ onTabChange }: DashboardStatsProps) => {
  const { stats } = useMusicStore();

  const statsData = [
    {
      icon: Disc,
      label: "Total Songs",
      value: stats.totalSongs.toString(),
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      tabValue: "songs",
    },
    {
      icon: Palette,
      label: "Total Artists",
      value: stats.totalArtists.toString(),
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
      tabValue: "artists",
    },
    {
      icon: DiscAlbum,
      label: "Total Albums",
      value: stats.totalAlbums.toString(),
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-500",
      tabValue: "albums",
    },

    {
      icon: Guitar,
      label: "Total Genres",
      value: stats.totalGenres.toLocaleString(),
      bgColor: "bg-rose-500/10",
      iconColor: "text-rose-500",
      tabValue: "genres",
    },
    {
      icon: Piano,
      label: "Instruments",
      value: stats.totalInstruments.toLocaleString(),
      bgColor: "bg-fuchsia-500/10",
      iconColor: "text-fuchsia-500",
      tabValue: "instruments",
    },
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      bgColor: "bg-sky-500/10",
      iconColor: "text-sky-500",
      tabValue: "users",
    },
  ];

  return (
    <section className="mb-12 p-8 rounded-lg bg-gradient-to-b from-zinc-900 to-zinc-800 shadow-lg">
      {/* Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-white">
          Dashboard Statistics
        </h2>
        <p className="text-sm text-zinc-400">
          Overview of your music collection
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-6">
        {statsData.map((stat) => (
          <StatsCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            bgColor={stat.bgColor}
            iconColor={stat.iconColor}
            onClick={() =>
              onTabChange(
                stat.tabValue as "songs" | "albums" | "artists" | "users"
              )
            }
          />
        ))}
      </div>
    </section>
  );
};

export default DashboardStats;
