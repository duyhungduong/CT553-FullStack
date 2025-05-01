import { useAuthStore } from "@/stores/useAuthStore";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AdminSidebar = () => {
  const { isAdmin } = useAuthStore();
  if (!isAdmin) return null;
  return (
    <SidebarMenuItem>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild>
              <Link to="/admin">
                <LayoutDashboardIcon />
                <span>Admin Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Admin Dashboard</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  );
};

export default AdminSidebar;
