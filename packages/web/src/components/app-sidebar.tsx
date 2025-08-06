import {
  Users,
  Inbox,
  Search,
  KeyRound,
  Trash2,
  Clock,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { CustomTrigger } from "./custom/customsidebartrigger";
import HomeButtonSidebar from "./custom/HomeButtonSidebar";
import { SignedIn } from "@clerk/clerk-react";
import { NavUser } from "./sidebar/nav-user";
import AdminSidebar from "./sidebar/admin-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SidebarLogo from "./sidebar/logo";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import QueueButtonSidebar from "./custom/QueueButtonSidebar";
import TimerButtonSidebar from "./custom/TimerButtonSidebar";
import { ScrollArea } from "./ui/scroll-area";
import LibraryButtonSidebar from "./custom/LibraryButtonSidebar";
import { axiosInstance } from "@/lib/axios";
import { Card } from "./ui/card";
// import PlayButton from "./sidebar/components/PlayButton";
import { useSearchStore } from "@/stores/useSearchStore";
import CompassButtonSidebar from "./custom/CompassButtonSidebar";
import AllSongButtonSidebar from "./custom/AllSongButtonSidebar";
import AllAlbumButtonSidebar from "./custom/AllAlbumButtonSidebar";
import AllArtistButtonSidebar from "./custom/AllArtistButtonSidebar";
import AllPlaylistButtonSidebar from "./custom/AllPlaylistButtonSidebar";
import AllGenreButtonSidebar from "./custom/AllGenreButtonSidebar";
import AllIntrumentButtonSidebar from "./custom/AllIntrumentButtonSidebar";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  isActive: boolean;
}

// This is sample data. Moved outside the component to prevent re-creation on every render.
const sampleData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "./banner0.png",
  },
  navMain: [
    { title: "Search", url: "/search", icon: Search, isActive: false },
    { title: "Inbox", url: "/message", icon: Inbox, isActive: false },
    {
      title: "Friends' Music Vibes",
      url: "/friendsactivity",
      icon: Users,
      isActive: false,
    },
    // { title: "Sent", url: "", icon: Send, isActive: false },
    { title: "Login", url: "/login", icon: KeyRound, isActive: false },
  ],
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: "Emily Davis",
      email: "emilydavis@example.com",
      subject: "Re: Question about Budget",
      date: "2 days ago",
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: "Michael Wilson",
      email: "michaelwilson@example.com",
      subject: "Important Announcement",
      date: "1 week ago",
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: "Sarah Brown",
      email: "sarahbrown@example.com",
      subject: "Re: Feedback on Proposal",
      date: "1 week ago",
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: "David Lee",
      email: "davidlee@example.com",
      subject: "New Project Idea",
      date: "1 week ago",
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: "Olivia Wilson",
      email: "oliviawilson@example.com",
      subject: "Vacation Plans",
      date: "1 week ago",
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: "James Martin",
      email: "jamesmartin@example.com",
      subject: "Re: Conference Registration",
      date: "1 week ago",
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: "Sophia White",
      email: "sophiawhite@example.com",
      subject: "Team Dinner",
      date: "1 week ago",
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = useState(sampleData.navMain[0]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("searchHistory") || "[]");
  });
  const { setSearchQuery, setSearchResults, searchResults } = useSearchStore();

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const [mails, setMails] = useState(sampleData.mails);
  const { state, toggleSidebar, setOpen } = useSidebar();

  const handleMenuClick = (item: NavItem) => {
    setActiveItem(item);
    if (item.title !== "Search") {
      // Create a copy before sorting to avoid mutating the original data and improve performance
      const shuffledMails = [...sampleData.mails].sort(
        () => Math.random() - 0.5
      );
      setMails(
        shuffledMails.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1))
      );
      setSearchResults({ songs: [], artists: [], albums: [] });
    }
    setOpen(true);

    // Thêm logic cho "Inbox"
    if (item.title === "Inbox" && state === "expanded") {
      toggleSidebar();
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory((prev) => [query.trim(), ...prev].slice(0, 10));
    }
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await axiosInstance.get(
          `/search?q=${encodeURIComponent(query)}`
        );
        setSearchResults({
          songs: response.data.results.songs || [],
          artists: response.data.results.artists || [],
          albums: response.data.results.albums || [],
        });
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({ songs: [], artists: [], albums: [] });
      }
    }
  };

  const clearHistoryItem = (index: number) => {
    setSearchHistory((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SignedIn>
                  <NavUser user={sampleData.user} />
                </SignedIn>
                <SidebarSeparator className="mx-0" />
                <AdminSidebar />
                <HomeButtonSidebar />
                <AllSongButtonSidebar />
                <AllAlbumButtonSidebar />
                <AllArtistButtonSidebar />
                <AllPlaylistButtonSidebar />
                <AllGenreButtonSidebar />
                <AllIntrumentButtonSidebar />
                <CompassButtonSidebar />

                <SignedIn>
                  <LibraryButtonSidebar />
                </SignedIn>
                {sampleData.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            tooltip={{ children: item.title, hidden: false }}
                            onClick={() => handleMenuClick(item)}
                            // isActive={activeItem.title === item.title}
                            className="px-2.5 md:px-2"
                            asChild
                          >
                            <Link to={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <span>{item.title}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                ))}
                <>
                  <QueueButtonSidebar />
                  <TimerButtonSidebar />
                  <CustomTrigger />
                  <SidebarSeparator className="mx-0" />
                </>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem.title}
            </div>
            {activeItem.title !== "Search" && (
              <Label className="flex items-center gap-2 text-sm">
                <span>Unreads</span>
                <Switch className="shadow-none" />
              </Label>
            )}
          </div>
          <SidebarInput
            placeholder={
              activeItem.title === "Search"
                ? "Search songs, artists..."
                : "Type to search..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && activeItem.title === "Search") {
                handleSearch(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-200px)]">
                {activeItem.title === "Search" ? (
                  searchResults.songs.length > 0 ||
                  searchResults.artists.length > 0 ||
                  searchResults.albums.length > 0 ? (
                    <>
                      {searchResults.songs.length > 0 && (
                        <div className="px-3 py-2">
                          <h3 className="font-medium text-sm mb-2 text-white">
                            Songs
                          </h3>
                          {searchResults.songs.map((song) => (
                            <Card
                              key={song._id}
                              className="flex items-center gap-1 p-1 hover:bg-zinc-800/50 transition-colors group cursor-pointer rounded-lg"
                            >
                              <img
                                src={song.imageUrl}
                                alt={song.title}
                                className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                              />
                              <Link
                                to={`/songs/${song._id}`}
                                className="truncate"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-ellipsis text-white truncate">
                                    {song.title}
                                  </p>
                                  <p className="text-xs text-zinc-400 truncate">
                                    {song.artists
                                      .map((artist) => artist.name)
                                      .join(", ")}
                                  </p>
                                </div>
                                {/* <PlayButton song={song} /> */}
                              </Link>
                            </Card>
                          ))}
                        </div>
                      )}
                      {searchResults.artists.length > 0 && (
                        <div className="px-3 py-2">
                          <h3 className="font-medium text-sm mb-2 text-white">
                            Artists
                          </h3>
                          {searchResults.artists.map((artist) => (
                            <Card
                              key={artist._id}
                              className="flex items-center gap-1 p-1 hover:bg-zinc-800/50 transition-colors group cursor-pointer rounded-lg"
                            >
                              <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                              <Link
                                to={`/artists/${artist._id}`}
                                className="truncate"
                              >
                                <p className="text-sm text-white truncate">
                                  {artist.name}
                                </p>
                              </Link>
                            </Card>
                          ))}
                        </div>
                      )}
                      {searchResults.albums.length > 0 && (
                        <div className="px-3 py-2">
                          <h3 className="font-medium text-sm mb-2 text-white">
                            Albums
                          </h3>
                          {searchResults.albums.map((album) => (
                            <Card
                              key={album._id}
                              className="flex items-center gap-1 p-1 hover:bg-zinc-800/50 transition-colors group cursor-pointer rounded-lg"
                            >
                              <img
                                src={album.imageUrl}
                                alt={album.title}
                                className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/albums/${album._id}`}
                                  className="truncate"
                                >
                                  <p className="text-sm text-white truncate">
                                    {album.title}
                                  </p>
                                </Link>
                                <p className="text-xs text-zinc-400 truncate">
                                  {album.artist}
                                </p>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  ) : searchHistory.length > 0 ? (
                    searchHistory.map((query, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-4 border-b last:border-b-0 hover:bg-zinc-800/50 text-white cursor-pointer"
                      >
                        <div
                          className="flex items-center gap-2"
                          onClick={() => handleSearch(query)}
                        >
                          <Clock className="size-4 text-zinc-400" />
                          <span className="text-sm">{query}</span>
                        </div>
                        <Trash2
                          className="size-4 text-zinc-400 hover:text-red-500"
                          onClick={() => clearHistoryItem(index)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-zinc-400">
                      No search history yet
                    </div>
                  )
                ) : (
                  mails.map((mail) => (
                    <a
                      href="#"
                      key={mail.email}
                      className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-zinc-800/50 text-white"
                    >
                      <div className="flex w-full items-center gap-2">
                        <span>{mail.name}</span>
                        <span className="ml-auto text-xs text-zinc-400">
                          {mail.date}
                        </span>
                      </div>
                      <span className="font-medium">{mail.subject}</span>
                      <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs text-zinc-400">
                        {mail.teaser}
                      </span>
                    </a>
                  ))
                  // renderMessages()
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
