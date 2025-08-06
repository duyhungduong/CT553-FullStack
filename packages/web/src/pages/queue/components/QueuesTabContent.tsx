import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic } from "lucide-react";
import QueueTable from "./QueueTable";

const QueuesTabContent = () => {
  return (
    <Card className="bg-zinc-800/60 border-zinc-700 shadow-lg rounded-xl transition-shadow hover:shadow-xl">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <ListMusic className="size-6 text-emerald-500 transition-transform duration-300 hover:scale-110" />
            <span className="text-2xl font-semibold text-white">Danh sách chờ</span>
          </CardTitle>
          {/* Uncomment if adding song dialog */}
          {/* <AddSongDialog /> */}
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        <QueueTable />
      </CardContent>
    </Card>
  );
};

export default QueuesTabContent;