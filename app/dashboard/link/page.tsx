"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { LinkClient } from "@/components/tables/user-tables/client";
import { useQuery } from "@tanstack/react-query";

const breadcrumbItems = [
  { title: "Dashboard", link: "/dashboard" },
  { title: "Link", link: "/dashboard/link" },
];

async function getLinks() {
  const res = await fetch("/api/link");
  if (!res.ok) throw new Error("Failed to fetch links");
  return res.json();
}

export default function Page() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["links"],
    queryFn: getLinks,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching links</div>;

  return (
    <PageContainer>
      <div className="space-y-2">
        <Breadcrumbs items={breadcrumbItems} />
        <LinkClient data={data.data} />
      </div>
    </PageContainer>
  );
}
