import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Clock4 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
const TimerButtonSidebar = () => {
  const [timeElapsed, setTimeElapsed] = useState(0); // Thời gian đã trôi qua (giây)
  const [isRunning, setIsRunning] = useState(false); // Trạng thái đang chạy hoặc dừng
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else if (!isRunning && timer) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Định dạng thời gian thành phút:giây
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Xử lý nút bắt đầu / tạm dừng
  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  // Đặt lại đồng hồ
  const resetTimer = () => {
    setIsRunning(false);
    setTimeElapsed(0);
  };

  return (
    <SidebarMenuItem>
      <Drawer>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild>
                <DrawerTrigger>
                  <Clock4 />
                  <span>Timer</span>
                </DrawerTrigger>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Timer</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="flex items-center justify-center space-x-0">
                <div className="text-6xl font-bold text-green-400 mb-8">
                  {formatTime(timeElapsed)}
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={toggleTimer}
                    variant="secondary"
                    className="px-6 py-2 rounded-lg text-lg font-medium"
                  >
                    {isRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    variant="destructive"
                    className="px-6 py-2 rounded-lg text-lg font-medium"
                  >
                    Reset
                  </Button>
                </div>

                {/* <EmblaCarousel loop={LOOP} /> */}
              </div>
            </div>

            <DrawerFooter>
              <Button variant="default">Submit</Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </SidebarMenuItem>
  );
};

export default TimerButtonSidebar;
