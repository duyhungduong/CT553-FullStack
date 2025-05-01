import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";

const chartConfig = {
  streams: {
    label: "Streams",
    color: "hsl(var(--chart-1))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RadarChartComponent() {
  const { radarChartData, fetchRadarChartData, isLoading, error } =
    useMusicStore();

  useEffect(() => {
    fetchRadarChartData();
  }, [fetchRadarChartData]);

  // Tính phần trăm thay đổi
  const latestMonth = radarChartData[radarChartData.length - 1];
  const previousMonth = radarChartData[radarChartData.length - 2];
  const trendPercentage =
    latestMonth && previousMonth
      ? ((latestMonth.streams +
          latestMonth.likes -
          previousMonth.streams -
          previousMonth.likes) /
          (previousMonth.streams + previousMonth.likes)) *
        100
      : 0;

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Radar Chart - Streams & Likes</CardTitle>
        <CardDescription>
          Showing total streams and likes for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading radar chart data...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : radarChartData.length === 0 ? (
          <div>No data available for the last 6 months.</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadarChart
              data={radarChartData}
              margin={{
                top: -40,
                bottom: -10,
              }}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <PolarAngleAxis dataKey="month" />
              <PolarGrid />
              <Radar
                dataKey="streams"
                fill="var(--color-streams)"
                fillOpacity={0.6}
              />
              <Radar
                dataKey="likes"
                fill="var(--color-likes)"
                fillOpacity={0.4}
              />
              <ChartLegend className="mt-8" content={<ChartLegendContent />} />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {trendPercentage > 0
            ? `Trending up by ${trendPercentage.toFixed(1)}% this month`
            : `Trending down by ${Math.abs(trendPercentage).toFixed(
                1
              )}% this month`}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {radarChartData[0]?.month} - {latestMonth?.month}
        </div>
      </CardFooter>
    </Card>
  );
}
