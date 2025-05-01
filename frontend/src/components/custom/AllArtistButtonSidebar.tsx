import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import {  Palette } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AllArtistButtonSidebar = () => {
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
                <Link to="/artists" onClick={handleClickButtonHome}>
                  <Palette className="" />
                  <span>Artists</span>
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Artists</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
}

export default AllArtistButtonSidebar