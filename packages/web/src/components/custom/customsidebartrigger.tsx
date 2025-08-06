import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export function CustomTrigger() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <SidebarMenuItem>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild>
              {state === "expanded" ? (
                <div
                  onClick={toggleSidebar}
                  className="transition-all duration-300"
                >
                  <PanelRightOpen />
                  <span>Collapsed</span>
                </div>
              ) : (
                <div
                  onClick={toggleSidebar}
                  className="transition-all duration-300"
                >
                  <PanelRightClose />
                  <span>Expanded</span>
                </div>
              )}
            </SidebarMenuButton>
          </TooltipTrigger>{" "}
          <TooltipContent side="right">
            {state === "expanded" ? (
              <span>Collapsed</span>
            ) : (
              <span>Expanded</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  );
}
