import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { DiscAlbum } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AllAlbumButtonSidebar = () => {
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
              <Link to="/albums" onClick={handleClickButtonHome}>
                <DiscAlbum className="" />
                <span>Albums</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Albums</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  );
};

export default AllAlbumButtonSidebar;
