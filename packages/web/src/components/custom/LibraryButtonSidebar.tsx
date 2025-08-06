import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import {  LibraryBig } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LibraryButtonSidebar = () => {
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
              <Link to="/library" onClick={handleClickButtonHome}>
                <LibraryBig className="" />
                <span>Library</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Library</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  )
}

export default LibraryButtonSidebar