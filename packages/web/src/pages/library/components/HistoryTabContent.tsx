import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";

const HistoryTabContent = () => {
  const {
    playHistory,
    fetchPlayHistoryByUser,
    deletePlayHistory,
    isLoading,
    error,
  } = useMusicStore();
  const { info } = useChatStore();

  // State cho ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (info?._id) {
      fetchPlayHistoryByUser(info._id);
    } else {
      toast.error("Please, login!!!");
    }
  }, [fetchPlayHistoryByUser, info]);

  // Hàm xóa toàn bộ lịch sử phát
  const handleClearAllHistory = async () => {
    if (!info?._id) {
      toast.error("User not logged in!");
      return;
    }

    if (playHistory.length === 0) {
      toast.success("No history to clear!");
      return;
    }
    if (!info?._id || playHistory.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all play history?"))
      return;

    try {
      // Gọi API để xóa toàn bộ lịch sử phát (nếu backend hỗ trợ)
      // await axiosInstance.delete(`/songs/play-history/user/${info._id}`);

      // Cập nhật state trong store
      useMusicStore.setState({
        playHistory: [],
        playHistoryTotal: 0,
      });
      toast.success("All play history cleared successfully!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to clear play history";
      toast.error(errorMessage);
    }
  };

  // Lọc danh sách playHistory dựa trên searchTerm
  const filteredPlayHistory = playHistory.filter((history) =>
    history.track_id.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin size-6 text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10 text-red-400">
        {error}
      </div>
    );
  }

  console.log("playHistory", playHistory);

  return (
    <Card className="bg-zinc-800/90 hover:shadow-lg transition-shadow rounded-xl">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle>Recently played:</CardTitle>
          <div className="flex items-center justify-center gap-5">
            <Button
              size={"sm"}
              className="rounded-sm text-xs"
              onClick={handleClearAllHistory}
              disabled={isLoading || playHistory.length === 0}
            >
              Clear all history
            </Button>
            <Input
              type="search"
              placeholder="Filter by song title"
              className="rounded-sm border-sky-900 w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-zinc-800/50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Song Title</TableHead>
              <TableHead className="hidden md:table-cell">
                Play Duration
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="hidden md:table-cell">Played At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayHistory.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-zinc-400 py-10"
                >
                  {searchTerm
                    ? "No matching play history found"
                    : "No play history available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayHistory.map((history) => (
                <TableRow key={history._id} className="hover:bg-zinc-800/50">
                  <TableCell>
                    <img
                      src={history.track_id.imageUrl}
                      alt={history.track_id.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {history.track_id.title}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDuration(history.play_duration)}
                  </TableCell>
                  <TableCell>{history.source}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(history.played_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlayHistory(history._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HistoryTabContent;
