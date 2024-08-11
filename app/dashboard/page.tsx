"use client";
import { useDashboardData } from "@/hooks/useDashboardData";
import PageContainer from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2Icon, MousePointerClickIcon, FlagIcon } from "lucide-react";
import { DashboardTopCountriesChart } from "@/components/charts/dashboard-top-countries-chart";
import { RecentLinks } from "@/components/recent-links";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();
  console.log("data", data);
  console.log("isLoading", isLoading);
  console.log("error", error);

  if (isLoading) {
    return (
      <PageContainer scrollable={true}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer scrollable={true}>
        <div className="flex items-center justify-center h-screen">
          An error occurred while fetching dashboard data: {error?.message}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex h-full items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, {data.name} 👋
          </h2>
        </div>
        <h3 className="text-xl font-bold tracking-tight space-y-4">Overview</h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Total Links Created"
            value={data.totalLinksCreated}
            icon={<Link2Icon className="h-4 w-4 text-muted-foreground" />}
          />
          <DashboardCard
            title="Unique Links Count"
            value={data.uniqueLinksCount}
            icon={
              <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
            }
          />
          <DashboardCard
            title="Top Country Clicks"
            value={data.topCountries[0]?.clickCount || 0}
            icon={<FlagIcon className="h-4 w-4 text-muted-foreground" />}
            subtext={data.topCountries[0]?.country || "N/A"}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <DashboardTopCountriesChart data={data.topCountries} />
          </div>
          <Card className="col-span-4 md:col-span-3">
            <CardHeader>
              <CardTitle>Recent Links Created</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentLinks links={data.lastFiveLinks} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtext?: string;
}

function DashboardCard({ title, value, icon, subtext }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && (
          <div className="text-xs text-muted-foreground">{subtext}</div>
        )}
      </CardContent>
    </Card>
  );
}
