import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brush } from "lucide-react";
import ArtistTable from "./components/ArtistTable";
import AddArtistDialog from "./components/AddArtistDialog";
import { Input } from "@/components/ui/input";

const ArtistsTabContent = () => {
  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brush className="h-5 w-5 text-orange-500" />
              Artists Library
            </CardTitle>
            <CardDescription>Manage your artists</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search artist..."
              // value={searchQuery}
              // onChange={handleSearchChange}
              className="w-64 bg-zinc-900 text-white border-zinc-700 focus:ring-orange-500"
            />
            <AddArtistDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ArtistTable />
      </CardContent>
    </Card>
  );
};

export default ArtistsTabContent;
