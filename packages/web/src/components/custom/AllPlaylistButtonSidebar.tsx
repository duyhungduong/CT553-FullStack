import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { ListVideo } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AllPlaylistButtonSidebar = () => {
    const { state, toggleSidebar } = useSidebar();
    const handleClickButtonHome = () => {
      if (state === "expanded") {
        toggleSidebar();
      }
    };
    return (
      <SidebarMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild>
                <Link to="/playlists" onClick={handleClickButtonHome}>
                  <ListVideo className="" />
                  <span>Playlists</span>
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Playlists</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
}

export default AllPlaylistButtonSidebar