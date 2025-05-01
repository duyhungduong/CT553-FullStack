import { Outlet } from "react-router-dom";
import AudioPlayer from "./components/AudioPlayer";
import PlaybackControls from "./components/PlaybackControls";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen={false} style={
      {
        "--sidebar-width": "350px",
      } as React.CSSProperties
    }>
      <AppSidebar />
      <SidebarInset>
        <div className=" bg-black text-white flex flex-col overflow-hidden">
          <div className="overflow-hidden flex-1">
            <AudioPlayer />
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <PlaybackControls />
    </SidebarProvider>
  );
};

export default MainLayout;
