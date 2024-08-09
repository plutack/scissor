import { Breadcrumbs } from '@/components/breadcrumbs';
import { ProductForm } from '@/components/forms/product-form';
import PageContainer from '@/components/layout/page-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';
import { AreaGraph } from "@/components/charts/area-graph";
import { DashboardTopCountriesChart } from "@/components/charts/dashboard-top-countries-chart";
import { PieGraph } from "@/components/charts/pie-graph";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { RecentLinks } from "@/components/recent-links";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/auth";
import { Link2Icon, MousePointerClickIcon, FlagIcon } from "lucide-react";

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Link', link: '/dashboard/link' },
  { title: 'Link details', link: '/dashboard/link/link-details' }
];

// TODO: Add the logic to fetch the link details based on the customSuffix
export default function Page() {
  (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex h-full items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
          {/* <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div> */}
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Clicks
                  </CardTitle>
                  <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {session?.user.totalClicks}
                  </div>
                  {/* <p className="text-xs text-muted-foreground">
                  </p> */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Links Created
                  </CardTitle>
                  <Link2Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {session?.user.totalLinksCount}
                  </div>
                  {/* <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p> */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Unique Countries
                  </CardTitle>
                  <FlagIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {session?.user.uniqueCountryCount}
                  </div>
                  {/* <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p> */}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <DashboardTopCountriesChart />
              </div>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Links Created</CardTitle>
                  <CardDescription>
                    Here are your most recent links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentLinks />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
