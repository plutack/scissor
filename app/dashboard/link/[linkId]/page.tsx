"use client";
import { notFound } from "next/navigation";
import { DashboardTopCountriesChart } from "@/components/charts/dashboard-top-countries-chart";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MousePointerClickIcon, FlagIcon, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import fetchLinkData from "@/utils/fetch-data";
import { useParams } from "next/navigation";
import { useQuery, QueryFunction } from "@tanstack/react-query";

interface LinkData {
  id: string;
  name: string | null;
  customSuffix: string;
  createdAt: string;
  updatedAt: string;
  clicks: number;
}

interface CountryData {
  country: string;
  clickCount: number;
}

interface StatsData {
  country: string;
  count: number;
  percentage: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    link: LinkData;
    totalVisits: number;
    uniqueCountriesCount: number;
    top5Countries: CountryData[];
    countryStats: StatsData[];
  };
}

export default function LinkAnalyticsPage() {
  const params = useParams();
  const linkId = params!.linkId as string;

  const queryFn: QueryFunction<ApiResponse> = () =>
    fetchLinkData(`/api/link/${linkId}`) as Promise<ApiResponse>;
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery<ApiResponse, Error>({
    queryKey: ["link", linkId],
    queryFn,
  });

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );

  if (error) return notFound();

  const {
    link,
    totalVisits,
    uniqueCountriesCount,
    top5Countries,
    countryStats,
  } = apiResponse!.data;

  const calculatedAverage =
    uniqueCountriesCount > 0
      ? Math.floor(link.clicks / uniqueCountriesCount)
      : 0;

  const handleDownloadReport = () => {
    const csvContent = [
      "Link Analytics Report",
      `Link: ${link.customSuffix}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      "Overview",
      `Total Visits,${totalVisits}`,
      `Countries Reached,${uniqueCountriesCount}`,
      "",
      "Top 5 Countries",
      "Country,Visits",
      ...top5Countries.map((c) => `${c.country},${c.clickCount}`),
      "",
      "Country Distribution",
      "Country,Visits,Percentage",
      ...countryStats.map((c) => `${c.country},${c.count},${c.percentage}`),
      "",
      "Performance",
      `Total Clicks,${link.clicks}`,
      `Average Visits per Country,${calculatedAverage}`,
      "",
      "Chart Recreation Commands",
      "To recreate the Top 5 Countries chart:",
      "1. Use a pie chart",
      "2. Labels: " + top5Countries.map((c) => c.country).join(", "),
      "3. Values: " + top5Countries.map((c) => c.clickCount).join(", "),
      "",
      "To recreate the Country Distribution table:",
      "1. Use the 'Country Distribution' section data",
      "2. Sort by the 'Visits' column in descending order",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const data = document.createElement("a");
    if (data.download !== undefined) {
      const url = URL.createObjectURL(blob);
      data.setAttribute("href", url);
      data.setAttribute(
        "download",
        `${link.customSuffix}-analytics-report.csv`,
      );
      data.style.visibility = "hidden";
      document.body.appendChild(data);
      data.click();
      document.body.removeChild(data);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex h-full items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {link.name || link.customSuffix} - Analytics
          </h2>
          <Button onClick={handleDownloadReport}>Download Report</Button>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Visits
                  </CardTitle>
                  <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVisits}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Countries Reached
                  </CardTitle>
                  <FlagIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {uniqueCountriesCount}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <DashboardTopCountriesChart
                  data={top5Countries}
                  title="Top 5 Countries"
                  description="Showing countries with the most clicks"
                />
              </div>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Country Distribution</CardTitle>
                  <CardDescription>
                    Full list of countries that have visited your link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CountryStatsTable countryStats={countryStats} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium">Total Clicks</h3>
                  <p className="text-2xl font-bold">{link.clicks}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    Average Visits per Country
                  </h3>
                  <p className="text-2xl font-bold">{calculatedAverage}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

interface CountryStatsTableProps {
  countryStats: StatsData[];
}

function CountryStatsTable({ countryStats }: CountryStatsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StatsData;
    direction: "ascending" | "descending";
  }>({ key: "count", direction: "descending" });

  if (countryStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-center text-muted-foreground">
          No data available. The link may not have been used yet.
        </p>
      </div>
    );
  }

  const sortedStats = [...countryStats].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredStats = sortedStats.filter((stat) =>
    stat.country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const requestSort = (key: keyof StatsData) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <Input
        placeholder="Search countries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort("country")}>
              Country
            </TableHead>
            <TableHead onClick={() => requestSort("count")}>Visits</TableHead>
            <TableHead onClick={() => requestSort("percentage")}>
              Percentage
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStats.map((stat, index) => (
            <TableRow key={index}>
              <TableCell>{stat.country}</TableCell>
              <TableCell>{stat.count}</TableCell>
              <TableCell>{stat.percentage}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
