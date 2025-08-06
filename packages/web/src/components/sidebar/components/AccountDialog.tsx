import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatStore } from "@/stores/useChatStore";

import { useEffect } from "react";

const AccountDialog = () => {
  const { info, fetchInfo } = useChatStore();

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return (
    <DialogContent className="">
      <DialogHeader>
        <DialogTitle>Account</DialogTitle>
        <DialogDescription>Account Information</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2 flex items-center justify-center gap-8">
        <Avatar className="h-20 w-20 rounded-lg">
          <AvatarImage src={info?.imageUrl} alt={info?.fullName} />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Name: {info?.fullName || "N/A"}</p>

          <div className="grid flex-1 text-left text-sm leading-tight">
            {info?.is_premium ? (
              <span className="truncate flex text-xs">
                Premium{" "}
                <img src={"/verified.svg"} alt="" className="size-4 ml-1" />
              </span>
            ) : (
              <span className="truncate text-xs">Basic</span>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            createdAt: {info?.createdAt || "N/A"}
          </p>
        </div>
      </div>
    </DialogContent>
  );
};

export default AccountDialog;
