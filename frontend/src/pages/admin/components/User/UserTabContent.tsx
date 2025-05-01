import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRound } from "lucide-react";
import React from "react";
import UsersTable from "./components/UsersTable";
import { Input } from "@/components/ui/input";
const UserTabContent = () => {
  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-sky-500" />
              Users Library
            </CardTitle>
            <CardDescription>Manage your users</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search users..."
              className="w-64 bg-zinc-900 text-white border-zinc-700 focus:ring-sky-500"
            />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <UsersTable />
      </CardContent>
    </Card>
  );
};

export default UserTabContent;
