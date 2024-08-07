"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link1Icon, ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LinkData {
  id: string;
  link: string;
  customSuffix: string;
}

const fetchRecentLinks = async (): Promise<LinkData[]> => {
  const response = await fetch("/api/link?limit=5"); // Adjust the API endpoint as needed
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data.data; // Assuming the API returns { data: [...] }
};

export function RecentLinks() {
  const { data, isLoading, error } = useQuery<LinkData[], Error>({
    queryKey: ["recentLinks"],
    queryFn: fetchRecentLinks,
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
      <CardHeader>
        <CardTitle>Recent Links</CardTitle>
        <CardDescription>
          Your most recently created short links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data &&
            data.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <Link1Icon className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${item.customSuffix}`}
                    target="_blank"
                    className="text-sm font-medium truncate block hover:underline"
                  >
                    {`${process.env.NEXT_PUBLIC_BASE_URL}/${item.customSuffix}`}
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.link}
                  </p>
                </div>
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
