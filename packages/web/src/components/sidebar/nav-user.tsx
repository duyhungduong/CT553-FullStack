import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect } from "react";
import { SignOutButton } from "@clerk/clerk-react";
import AccountDialog from "./components/AccountDialog";
import { Dialog, DialogTrigger } from "../ui/dialog";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { info, fetchInfo } = useChatStore();

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={info?.imageUrl} alt={user.name} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {info?.fullName}
                      </span>
                      {info?.is_premium ? (
                        <span className="truncate text-xs flex text-indigo-200">
                          Premium{" "}
                          <img
                            src={"/verified.svg"}
                            alt=""
                            className="size-4 ml-1"
                          />
                        </span>
                      ) : (
                        <span className="truncate text-xs">Basic</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? "bottom" : "right"}>
                <span>Profile</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={info?.imageUrl} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {info?.fullName}
                  </span>
                  <span className="truncate text-xs">
                    {info?.is_premium ? (
                      <span className="truncate text-xs flex text-indigo-200">
                        Premium{" "}
                        <img
                          src={"/verified.svg"}
                          alt=""
                          className="size-4 ml-1"
                        />
                      </span>
                    ) : (
                      <span className="truncate text-xs">Basic</span>
                    )}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            {info?.is_premium ? null : (
              <div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Premium
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                </DialogTrigger>
                <AccountDialog />
              </Dialog>

              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
