import React, { useState } from "react";
import { ShortenLinkFormBase } from "@/components/forms/shorten-link-form-base";
import { QRCodePopover } from "@/components/forms/qr-code-popover";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "@prisma/client";

export function ProtectedShortenLinkForm() {
  const [showForm, setShowForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [shortUrl, setShortUrl] = useState("");

  const handleSuccess = ({ data }: { data: Link }) => {
    setShortUrl(`${process.env.NEXTAUTH_URL}/${data.customSuffix}`);
    setShowForm(false);
    setShowQRCode(true);
  };

  return (
    <>
      <Popover open={showForm} onOpenChange={setShowForm}>
        <PopoverTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Create Short Link
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <ShortenLinkFormBase onSuccess={handleSuccess} isProtectedRoute />
        </PopoverContent>
      </Popover>
      {showQRCode && (
        <QRCodePopover
          shortUrl={shortUrl}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </>
  );
}
