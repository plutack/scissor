"use client";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TopCountry {
  country: string;
  clickCount: number;
}

interface DashboardTopCountriesChartProps {
  data: TopCountry[];
}

const chartConfig = {
  clickCount: {
    label: "Number of Clicks",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// TODO: export as a chart?
export function DashboardTopCountriesChart({ data }: DashboardTopCountriesChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Top 5 Countries by Clicks</CardTitle>
          <CardDescription>
            Showing countries with the most clicks across all links
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {data && data.length >= 5 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="country"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="clickCount"
                    labelFormatter={(value) => value}
                  />
                }
              />
              <Bar dataKey="clickCount" fill={`var(--color-clickCount)`} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px]">
            Not enough data to display chart
          </div>
        )}
      </CardContent>
    </Card>
  );
}