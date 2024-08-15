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
import { Link } from "@/constants/data";
import { Edit, MoreHorizontal, Trash, Check, X } from "lucide-react";
import { useState } from "react";

interface CellActionProps {
  data: Link;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(data.name); // Assuming we're editing the name

  const onConfirm = async () => {
    // Delete logic here
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onUpdate = (name: string, newValue: string) => {
  };

  const handleSave = () => {
    onUpdate(data.name, editedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(data.customSuffix);
    setIsEditing(false);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
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
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};
