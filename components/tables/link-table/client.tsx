"use client";

import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { ShortenLinkButton } from "@/components/forms/shorten-link-button-form";

interface Link {
  id: string;
  name: string;
  link: string;
  customSuffix: string;
  clicks: number;
  onRowClick?: (row: Link) => void;
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
    router.push(`/dashboard/link/${row.id}`);
  };

  const dataWithRowClick = data.map(row => ({
    ...row,
    onRowClick: handleRowClick
  }));

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
        data={dataWithRowClick}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
      />
    </>
  );
};