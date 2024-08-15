"use client";
import React, { useState } from "react";
import { ShortenLinkFormBase } from "@/components/forms/shorten-link-form-base";
import { QRCodePopover } from "@/components/forms/qr-code-popover";
import { Link } from "@prisma/client";

export function HomeShortenLinkForm() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [shortUrl, setShortUrl] = useState("");

  const handleSuccess = ({ data }: { data: Link }) => {
    const newShortUrl = `${process.env.NEXTAUTH_URL}/${data.customSuffix}`;
    setShortUrl(newShortUrl);
    setShowQRCode(true);
  };

  return (
    <>
      <ShortenLinkFormBase onSuccess={handleSuccess} isProtectedRoute={false} />
      {showQRCode && (
        <QRCodePopover
          shortUrl={shortUrl}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </>
  );
}
