"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { ShortenLinkButton } from "@/components/forms/shorten-link-button-form";

interface Link {
  name: string;
  link: string;
  customSuffix: string;
  clicks: number;
}

interface LinkProps {
  data: Link[];
  pagination: {
    page: number;
    limit: number;
    totalLinks: number;
    totalPages: number;
  };
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const LinkClient: React.FC<LinkProps> = ({
  data,
  pagination,
  onNextPage,
  onPreviousPage,
}) => {
  const router = useRouter();
  const handleRowClick = (row: Link) => {
    // TODO Navigate to the link details page or perform any action
    router.push(`/dashboard/link/${row.customSuffix}`);
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Links (${data.length})`} description="Manage links " />
        <ShortenLinkButton />
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        data={data}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        onRowClick={handleRowClick}
      />
    </>
  );
};
