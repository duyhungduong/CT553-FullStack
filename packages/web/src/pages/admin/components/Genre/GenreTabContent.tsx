import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Disc3 } from "lucide-react";
import AddGenreDialog from "./components/AddGenreDialog";
import GenreTable from "./components/GenreTable";
import { Input } from "@/components/ui/input";
const GenreTabContent = () => {
  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Disc3 className="h-5 w-5 text-rose-500" />
              Genre Library
            </CardTitle>
            <CardDescription>Manage your genre collection</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search genres..."
              // value={searchQuery}
              // onChange={handleSearchChange}
              className="w-64 bg-zinc-900 text-white border-zinc-700 focus:ring-rose-500"
            />
            <AddGenreDialog />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <GenreTable />
      </CardContent>
    </Card>
  );
};

export default GenreTabContent;
