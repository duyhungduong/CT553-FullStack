import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Compass } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const CompassButtonSidebar = () => {
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
              <Link to="/explore" onClick={handleClickButtonHome}>
                <Compass className=""/>
                <span>Explore</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Explore</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  );
};

export default CompassButtonSidebar