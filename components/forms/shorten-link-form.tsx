"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shortenLinkSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Twitter, Facebook, Share2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type FormValues = z.infer<typeof shortenLinkSchema>;

interface GeneratedLinkData {
  id: string;
  link: string;
  customSuffix: string;
  name?: string;
}

interface ShortenLinkFormProps {
  isHomePage: boolean;
  triggerButton?: React.ReactNode;
}

export function ShortenLinkForm({
  isHomePage,
  triggerButton,
}: ShortenLinkFormProps) {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<GeneratedLinkData | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { toast } = useToast();
  const baseUrl = process.env.NEXTAUTH_URL;

  const form = useForm<FormValues>({
    resolver: zodResolver(shortenLinkSchema),
    defaultValues: {
      link: "",
      customSuffix: "",
      name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedLink(result.data);
        if (isHomePage) {
          setIsDialogOpen(true);
        } else {
          setIsPopoverOpen(true);
        }
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate short link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    const shortUrl = `${baseUrl}/${generatedLink.customSuffix}`;
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

  const shareToSocial = (platform: "twitter" | "facebook" | "reddit") => {
    if (!generatedLink) return;
    const shortUrl = `${baseUrl}/${generatedLink.customSuffix}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shortUrl,
      )}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shortUrl,
      )}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shortUrl)}`,
    };
    window.open(urls[platform], "_blank");
  };

  const downloadQRCode = () => {
    if (!generatedLink) return;
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-${generatedLink.customSuffix}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL to shorten</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isHomePage && (
          <>
            <FormField
              control={form.control}
              name="customSuffix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Suffix (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-custom-link"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My awesome link"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button disabled={loading} className="ml-auto w-full" type="submit">
          Shorten Link
        </Button>
      </form>
    </Form>
  );

  const resultContent = (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Your Short Link</h4>
        <p className="text-sm text-muted-foreground">
          Click to copy or share on social media
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Input value={`${baseUrl}/${generatedLink?.customSuffix}`} readOnly />
        <Button size="sm" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-center">
        <QRCodeSVG
          id="qr-code"
          value={`${baseUrl}/${generatedLink?.customSuffix}`}
          size={isHomePage ? 256 : 128}
        />
      </div>
      <div className="flex justify-between space-x-2">
        <Button size="sm" onClick={downloadQRCode}>
          <Download className="h-4 w-4" />
        </Button>
        <div className="flex space-x-2">
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

  if (isHomePage) {
    return (
      <>
        {formContent}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            {resultContent}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        {triggerButton || <Button>Shorten Link</Button>}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {generatedLink ? resultContent : formContent}
      </PopoverContent>
    </Popover>
  );
}
