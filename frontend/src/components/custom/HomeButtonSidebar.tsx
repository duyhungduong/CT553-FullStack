import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Home } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const HomeButtonSidebar = () => {
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
              <Link to="/" onClick={handleClickButtonHome}>
                <Home className=""/>
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Home</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  );
};

export default HomeButtonSidebar;
