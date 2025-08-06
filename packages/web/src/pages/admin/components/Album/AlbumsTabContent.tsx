import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Library } from "lucide-react";
import AlbumsTable from "./components/AlbumsTable";
import AddAlbumDialog from "./components/AddAlbumDialog";

import { Input } from "@/components/ui/input";

const AlbumsTabContent = () => {
  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-violet-500" />
              Albums Library
            </CardTitle>
            <CardDescription>Manage your album collection</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search albums..."
              // value={searchQuery}
              // onChange={handleSearchChange}
              className="w-64 bg-zinc-900 text-white border-zinc-700 focus:ring-violet-500"
            />
            <AddAlbumDialog />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AlbumsTable />
      </CardContent>
    </Card>
  );
};

export default AlbumsTabContent;
