import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect } from "react";
import ShowDetailInstrument from "./ShowDetailinstrument";

const InstrumentTable = () => {
  const { instruments, fetchInstruments, isLoading, error } = useMusicStore();

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin size-8 text-indigo-500" />
        <span className="ml-2 text-zinc-400">Loading instruments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10 text-red-400 bg-red-900/10 rounded-lg p-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-800/50 border-b border-zinc-700/50 hover:bg-zinc-800 transition-colors duration-200">
            <TableHead className="w-[60px] text-zinc-300">Image</TableHead>
            <TableHead className="text-zinc-300">Name</TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300">Description</TableHead>
            <TableHead className="text-zinc-300">Family</TableHead>
            <TableHead className="text-right text-zinc-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instruments.map((instrument) => (
            <TableRow
              key={instrument._id}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/70 transition-colors duration-200"
            >
              <TableCell>
                <div className="relative group">
                  <img
                    src={instrument.imageUrl}
                    alt={instrument.name}
                    className="w-12 h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                </div>
              </TableCell>
              <TableCell className="font-medium text-white">
                <ShowDetailInstrument instrument={instrument} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-zinc-400">
                {instrument.description.length > 100
                  ? `${instrument.description.substring(0, 100)}...`
                  : instrument.description}
              </TableCell>
              <TableCell className="text-zinc-400">{instrument.family}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    // onClick={() => deleteInstrument(instrument._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {instruments.length === 0 && (
        <div className="text-center py-10 text-zinc-400">
          No instruments found.
        </div>
      )}
    </div>
  );
};

export default InstrumentTable;