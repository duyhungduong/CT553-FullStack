import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

const FollowsTabContent = () => {
  return (
    <Card className="bg-zinc-800/90 hover:shadow-lg transition-shadow rounded-xl">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle>Hear what the people you follow have posted:</CardTitle>
          <div className="flex items-center justify-center gap-5">
            <Input
              type="search"
              placeholder="Filter"
              className="rounded-sm border-sky-900 w-72"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        {/* <AddPlaylistSheet /> */}
      </CardContent>
    </Card>
  );
};

export default FollowsTabContent;
