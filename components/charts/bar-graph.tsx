'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'An interactive bar chart';

const placeholderData = [
  { country: 'USA', noofvisits: 150 },
  { country: 'Canada', noofvisits: 180 },
  { country: 'UK', noofvisits: 120 },
  { country: 'Germany', noofvisits: 260 },
  { country: 'France', noofvisits: 290 },
  { country: 'Japan', noofvisits: 340 },
  { country: 'Australia', noofvisits: 160 },
];

const chartConfig = {
  views: {
    label: 'Page Views'
  },
  visits: {
    label: 'Number of Visits',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;


// TODO: reconfigure the chart to use the data from the API
export function BarGraph() {
  const [chartData, setChartData] = React.useState(placeholderData);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.example.com/visits');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
// TODO change to lucide spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart</CardTitle>
          <CardDescription>
            Showing countries with the most page views
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => value}
                />
              }
            />
            <Bar dataKey="noofvisits" fill={`var(--color-visits)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
