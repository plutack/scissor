"use client"
import React, { useState } from "react";
import { ShortenLinkFormBase } from "@/components/forms/shorten-link-form-base";
import { QRCodePopover } from "@/components/forms/qr-code-popover";

export function HomeShortenLinkForm() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [shortUrl, setShortUrl] = useState("");

  const handleSuccess = (data: any) => {
    setShortUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/${data.customSuffix}`);
    setShowQRCode(true);
  };

  return (
    <>
      <ShortenLinkFormBase onSuccess={handleSuccess} isProtectedRoute={false} />
      {showQRCode && (
        <QRCodePopover shortUrl={shortUrl} onClose={() => setShowQRCode(false)} />
      )}
    </>
  );
}
