import React, { useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, X, Twitter, Facebook, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { saveAs } from "file-saver";

type QRCodePopoverProps = {
  shortUrl: string;
  onClose: () => void;
};

export function QRCodePopover({ shortUrl, onClose }: QRCodePopoverProps) {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const svgElement = qrRef.current.querySelector("svg");
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, "qrcode.png");
            }
          });
        };
        img.src =
          "data:image/svg+xml;base64," +
          btoa(decodeURIComponent(encodeURIComponent(svgData)));
      }
    }
  };

  const shareToSocial = (platform: "twitter" | "facebook" | "reddit") => {
    const urls = {
      twitter: `https://x.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shortUrl
      )}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shortUrl)}`,
    };
    window.open(urls[platform], "_blank");
  };

  return (
    <div className="fixed z-20 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Short Link</h2>
          <Button variant="default" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Input value={shortUrl} readOnly className="text-orange-900" />
          <Button size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center mb-4" ref={qrRef}>
          <QRCodeSVG value={shortUrl} size={256} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button className="w-full" onClick={downloadQRCode}>
            <Download className="h-4 w-4 mr-2" /> Download QR Code
          </Button>
          <Button className="w-full" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" /> Copy Link
          </Button>
        </div>
        <div className="flex justify-center space-x-2">
          <Button size="sm" onClick={() => shareToSocial("twitter")}>
            <Twitter className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => shareToSocial("facebook")}>
            <Facebook className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => shareToSocial("reddit")}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
