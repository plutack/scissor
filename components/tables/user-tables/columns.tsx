// In your columns.ts file
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "@/components/tables/user-tables/cell-action";

export type Link = {
  name: string;
  link: string;
  customSuffix: string;
  clicks: number;
};

export const columns: ColumnDef<Link>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "link",
    header: "Link",
  },
  {
    accessorKey: "customSuffix",
    header: "Custom Suffix",
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
