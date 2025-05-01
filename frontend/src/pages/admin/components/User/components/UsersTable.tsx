import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useChatStore } from "@/stores/useChatStore";
import { Calendar, Loader2 } from "lucide-react";
import { useEffect } from "react";
import AlertDeleteUserDialog from "./AlertDeleteUserDialog";

const UsersTable = () => {
  const { users, fetchUsers, isLoading, error } = useChatStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin size-8 text-indigo-500" />
        <span className="ml-2 text-zinc-400">Loading users...</span>
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
            <TableHead className="w-[50px] text-zinc-300">#</TableHead>
            <TableHead className="w-[100px] text-zinc-300">Image</TableHead>
            <TableHead className="text-zinc-300">Full Name</TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300 cursor-pointer">
              Created At
            </TableHead>
            <TableHead className="hidden md:table-cell text-zinc-300 cursor-pointer">
              Updated At
            </TableHead>
            <TableHead className="text-right text-zinc-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user._id}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/70 transition-colors duration-200"
            >
              <TableCell className="text-zinc-400">{index + 1}</TableCell>
              <TableCell>
                <div className="relative group">
                  <img
                    src={user.imageUrl}
                    alt={user.fullName}
                    className="w-16 h-16 rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                </div>
              </TableCell>
              <TableCell className="font-medium text-white">
                {user.fullName}
              </TableCell>
              <TableCell className="hidden md:table-cell text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {user.createdAt?.split("T")[0] || "Unknown"}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {user.updatedAt?.split("T")[0] || "Unknown"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <AlertDeleteUserDialog userId={user._id}/>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.length === 0 && (
        <div className="text-center py-10 text-zinc-400">
          No users found.
        </div>
      )}
    </div>
  );
};

export default UsersTable;