import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Guitar } from "lucide-react";
import AddInstrumentDialog from "./components/AddInstrumentDialog";
import InstrumentTable from "./components/InstrumentTable";

import { Input } from "@/components/ui/input";
const InstrumentTabContent = () => {
  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Guitar className="h-5 w-5 text-fuchsia-500" />
              Instrument Library
            </CardTitle>
            <CardDescription>Manage your instrument collection</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search instruments..."
              className="w-64 bg-zinc-900 text-white border-zinc-700 focus:ring-fuchsia-500"
            />
            <AddInstrumentDialog />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <InstrumentTable />
      </CardContent>
    </Card>
  );
};

export default InstrumentTabContent;
