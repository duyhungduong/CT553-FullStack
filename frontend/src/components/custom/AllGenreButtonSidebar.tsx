
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Guitar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const AllGenreButtonSidebar = () => {
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
                <Link to="/genres" onClick={handleClickButtonHome}>
                  <Guitar className="" />
                  <span>Genres</span>
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Genres</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
}

export default AllGenreButtonSidebar