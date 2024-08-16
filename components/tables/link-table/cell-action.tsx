"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/tables/link-table/columns";
import {
  Edit,
  MoreHorizontal,
  Trash,
  Check,
  X,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CellActionProps {
  data: Link;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(data.name);

  const onConfirm = async () => {
    //TODO: Delete logic here
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onUpdate = (name: string, newValue: string) => {};

  const handleSave = () => {
    onUpdate(data.name, editedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(data.customSuffix);
    setIsEditing(false);
  };

  const handleViewAnalytics = () => {
    router.push(`/dashboard/link/${data.id}`);
  };

  const handleVisitLink = () => {
    if (!data.customSuffix) {
      console.error('Custom suffix is missing');
      return;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/${data.customSuffix}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleVisitLink} variant="ghost" size="sm">
        <ExternalLink className="h-4 w-4" />
      </Button>
      {isEditing ? (
        <div className="flex items-center">
          <Input
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSave} size="sm" className="mr-1">
            <Check className="h-4 w-4" />
          </Button>
          <Button onClick={handleCancel} size="sm" variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleViewAnalytics}>
              <Eye className="mr-2 h-4 w-4" /> View Analytics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
    </div>
  );
};