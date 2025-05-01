import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { Sheet, SheetContent } from "../ui/sheet";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false); // Biến kiểm tra trước đó có mất mạng không
  const [songDialogOpen, setSongDialogOpen] = useState(true);
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("Internet đã được kết nối lại! 🎉", {
          style: {
            borderRadius: "8px",
            background: "#1f2937",
            color: "#22c55e",
            padding: "12px 16px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#1f2937",
          },
        });
        setWasOffline(false); // Reset trạng thái mất mạng
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true); // Đánh dấu là từng mất mạng
      toast.error("Mất kết nối Internet! ⚠️", {
        style: {
          borderRadius: "8px",
          background: "#1f2937",
          color: "#ef4444",
          padding: "12px 16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#1f2937",
        },
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return (
    !isOnline && (
      <Sheet open={songDialogOpen} onOpenChange={setSongDialogOpen}>
        <SheetContent side={"top"} className="w-[400px] sm:w-[540px] bg-zinc-900 rounded-lg p-1 m-3">
          <Alert variant={"destructive"} onClick={() => setSongDialogOpen(false)}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Bạn đang offline, vui lòng kiểm tra kết nối!
            </AlertDescription>
          </Alert>
        </SheetContent>
      </Sheet>
    )
  );
};

export default NetworkStatus;
