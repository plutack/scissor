"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { LinkClient } from "@/components/tables/link-table/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const breadcrumbItems = [
  { title: "Dashboard", link: "/dashboard" },
  { title: "Link", link: "/dashboard/link" },
];

async function getLinks(page: number, limit: number) {
  const res = await fetch(`/api/link?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch links");
  return res.json();
}

export default function Page() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["links", page, limit],
    queryFn: () => getLinks(page, limit),
  });

  const handleNextPage = () => {
    if (page < data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
// TODO change to lucide spinner
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching links</div>;

  return (
    <PageContainer>
      <div className="space-y-2">
        <Breadcrumbs items={breadcrumbItems} />
        <LinkClient 
          data={data.data} 
          pagination={data.pagination}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </PageContainer>
  );
}
