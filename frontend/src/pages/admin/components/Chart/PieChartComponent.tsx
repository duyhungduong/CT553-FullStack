import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMusicStore } from "@/stores/useMusicStore";

const chartConfig = {
  listeners: {
    label: "Listeners",
  },
  streams: {
    label: "Streams",
  },
  likes: {
    label: "Likes",
  },
  october: {
    label: "October",
    color: "hsl(var(--chart-1))",
  },
  november: {
    label: "November",
    color: "hsl(var(--chart-2))",
  },
  december: {
    label: "December",
    color: "hsl(var(--chart-3))",
  },
  january: {
    label: "January",
    color: "hsl(var(--chart-4))",
  },
  february: {
    label: "February",
    color: "hsl(var(--chart-5))",
  },
  march: {
    label: "March",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function PieChartComponent() {
  const { pieChartStreamsData, pieChartLikesData, fetchPieChartData, isLoading, error } =
    useMusicStore();

  React.useEffect(() => {
    fetchPieChartData();
  }, [fetchPieChartData]);

  // Tính phần trăm thay đổi (so sánh tháng gần nhất với tháng trước đó)
  const latestStreams = pieChartStreamsData[pieChartStreamsData.length - 1];
  const previousStreams = pieChartStreamsData[pieChartStreamsData.length - 2];
  const latestLikes = pieChartLikesData[pieChartLikesData.length - 1];
  const previousLikes = pieChartLikesData[pieChartLikesData.length - 2];
  const trendPercentage =
    latestStreams && previousStreams && latestLikes && previousLikes
      ? ((latestStreams.streams +
          latestLikes.likes -
          previousStreams.streams -
          previousLikes.likes) /
          (previousStreams.streams + previousLikes.likes)) *
        100
      : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Streams & Likes</CardTitle>
        <CardDescription>October 2024 - March 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div>Loading pie chart data...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : pieChartStreamsData.length === 0 || pieChartLikesData.length === 0 ? (
          <div>No data available for the last 6 months.</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelKey="listeners"
                    nameKey="month"
                    indicator="line"
                    labelFormatter={(_, payload) => {
                      return chartConfig[
                        payload?.[0].dataKey as keyof typeof chartConfig
                      ].label;
                    }}
                  />
                }
              />
              <Pie data={pieChartStreamsData} dataKey="streams" outerRadius={60} />
              <Pie
                data={pieChartLikesData}
                dataKey="likes"
                innerRadius={70}
                outerRadius={90}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {trendPercentage > 0
            ? `Trending up by ${trendPercentage.toFixed(1)}% this month`
            : `Trending down by ${Math.abs(trendPercentage).toFixed(1)}% this month`}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total streams and likes for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}