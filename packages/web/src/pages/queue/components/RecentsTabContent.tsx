import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"
import RecentTable from "./RecentTable"


const RecentsTabContent = () => {
  return (
    <Card className="bg-zinc-800/60 hover:shadow-lg transition-shadow rounded-xl">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div>
            <CardTitle className="flex items-center gap-3">
              <History className="size-6 text-emerald-500 transition-transform duration-300 hover:scale-110" />
              <span className="text-xl font-semibold text-white">Đã phát gần đây</span>
            </CardTitle>
          </div>

          {/* Add Song Button */}
          {/* <AddSongDialog /> */}
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-b-xl">
        <RecentTable/>
      </CardContent>
    </Card>
  )
}

export default RecentsTabContent