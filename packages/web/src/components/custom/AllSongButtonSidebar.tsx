import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Disc} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AllSongButtonSidebar = () => {
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
              <Link to="/songs" onClick={handleClickButtonHome}>
                <Disc className=""/>
                <span>Songs</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Songs</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  )
}

export default AllSongButtonSidebar