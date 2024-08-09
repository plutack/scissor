"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

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
  clicks: number;
}

const chartConfig = {
  clicks: {
    label: "Number of Clicks",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// TODO change to ky
const fetchTopCountries = async (): Promise<TopCountry[]> => {
  const response = await fetch("/api/link/top-countries");
  if (!response.ok) {
    throw new Error("cannot fetch data");
  }

  const { data } = await response.json();
  return data;
};

export function DashboardTopCountriesChart() {
  const { data, isLoading, error } = useQuery<TopCountry[], Error>({
    queryKey: ["topCountries"],
    queryFn: fetchTopCountries,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[280px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[280px]">
          <div>An error occurred: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

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
                    nameKey="clicks"
                    labelFormatter={(value) => value}
                  />
                }
              />
              <Bar dataKey="clicks" fill={`var(--color-clicks)`} />
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
