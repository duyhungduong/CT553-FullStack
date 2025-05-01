import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import {  Piano } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const AllIntrumentButtonSidebar = () => {
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
                <Link to="/instruments" onClick={handleClickButtonHome}>
                  <Piano className="" />
                  <span>Instruments</span>
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Instruments</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
}

export default AllIntrumentButtonSidebar