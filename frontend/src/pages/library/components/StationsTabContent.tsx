import { Card, CardContent} from "@/components/ui/card";
import {  Radio } from "lucide-react";

const StationsTabContent = () => {
  return (
    <Card className="bg-zinc-800/90 hover:shadow-lg transition-shadow rounded-xl">
      <CardContent className=" p-6 h-full bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        <div className=" flex items-center justify-center">
          <Radio className="w-80 h-80" />
        </div>
        <div className=" flex items-center justify-center">
          <span className="text-xl">You have not liked any stations yet</span>
        </div>
        <div className=" flex items-center justify-center">
          <span>Browse trending playlists</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StationsTabContent;
