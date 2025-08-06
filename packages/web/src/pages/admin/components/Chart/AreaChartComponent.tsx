import React, { useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMusicStore } from "@/stores/useMusicStore";
import toast from "react-hot-toast";

const chartConfig = {
  visitors: {
    label: "Listeners",
  },
  streams: {
    label: "Streams",
    color: "hsl(var(--chart-1))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const AreaChartComponent = () => {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("7d");
  const { chartData, fetchChartData, isLoading, error } = useMusicStore();

  useEffect(() => {
    console.log("Fetching chart data for timeRange:", timeRange);
    fetchChartData({ timeRange, groupBy: "day" })
      .then(() => {
        console.log("Chart data loaded for timeRange:", timeRange);
        // Hiển thị toast khi sử dụng cache (tùy chọn)
        if (useMusicStore.getState().chartDataCache[timeRange]) {
          toast.success(`Loaded cached data for ${timeRange}`, {
            duration: 2000,
            style: {
              background: "#1f2937",
              color: "#22c55e",
              borderRadius: "8px",
            },
          });
        }
      })
      .catch((err) => console.error("Error fetching chart data:", err));
  }, [fetchChartData, timeRange]);

  // Memoize filtered data
  const filteredData = React.useMemo(
    () =>
      chartData.filter(
        (item): item is { date: string; streams: number; likes: number } =>
          "date" in item &&
          !isNaN(new Date(item.date).getTime()) &&
          new Date(item.date) <= new Date()
      ),
    [chartData]
  );

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total streams and likes up to today
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d")}
        >
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 7 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div>Loading chart data...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : filteredData.length === 0 ? (
          <div>No data available for {timeRange}. Try another time range.</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillStreams" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-streams)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-streams)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-likes)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-likes)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="likes"
                type="natural"
                fill="url(#fillLikes)"
                stroke="var(--color-likes)"
                stackId="a"
              />
              <Area
                dataKey="streams"
                type="natural"
                fill="url(#fillStreams)"
                stroke="var(--color-streams)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default AreaChartComponent;
