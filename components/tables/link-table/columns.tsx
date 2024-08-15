import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "@/components/tables/link-table/cell-action";

const renderDashForNull = (value: any) => value ?? "-";

export type Link = {
  id: string;
  name: string;
  link: string;
  customSuffix: string;
  clicks: number;
};

export const columns: ColumnDef<Link>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => renderDashForNull(row.getValue("name")),
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row }) => renderDashForNull(row.getValue("link")),
  },
  {
    accessorKey: "customSuffix",
    header: "Custom Suffix",
    cell: ({ row }) => renderDashForNull(row.getValue("customSuffix")),
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
    cell: ({ row }) => renderDashForNull(row.getValue("clicks")),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />, // FIXME: udpdate and delete actions
  },
];
