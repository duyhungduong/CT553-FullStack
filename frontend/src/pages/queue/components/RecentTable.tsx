import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useChatStore } from "@/stores/useChatStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { formatDuration } from "@/utils/formatDuration";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const RecentTable = () => {
  const {
    playHistory,
    fetchPlayHistoryByUser,
    deletePlayHistory,
    isLoading,
    error,
  } = useMusicStore();
  const { info } = useChatStore();

  // State cho ô tìm kiếm
  const [searchTerm] = useState<string>("");

  useEffect(() => {
    if (info?._id) {
      fetchPlayHistoryByUser(info._id);
    } else {
      toast.error("Please, login!!!");
    }
  }, [fetchPlayHistoryByUser, info]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin size-6 text-zinc-400" />
      </div>
    );
  }

  // Lọc danh sách playHistory dựa trên searchTerm
  const filteredPlayHistory = playHistory.filter((history) =>
    history.track_id.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex items-center justify-center py-10 text-red-400">
        {error}
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-zinc-800/50">
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Song Title</TableHead>
          <TableHead className="hidden md:table-cell">Play Duration</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="hidden md:table-cell">Played At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPlayHistory.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-zinc-400 py-10">
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
                {history.played_at &&
                !isNaN(new Date(history.played_at).getTime())
                  ? new Date(history.played_at).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "2-digit",
                    })
                  : "Just now"}
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
  );
};

export default RecentTable;
