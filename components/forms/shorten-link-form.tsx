"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ky from "ky";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shortenLinkSchema } from "@/schemas";

import {
  Form,
  FormControl,
  FormDescription,
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
import { Copy, Twitter, Facebook, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type FormValues = z.infer<typeof shortenLinkSchema>;

interface GeneratedLinkData {
  id: string;
  link: string;
  customSuffix: string;
}

export function ShortenLinkForm() {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<GeneratedLinkData | null>(
    null,
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const form = useForm<FormValues>({
    resolver: zodResolver(shortenLinkSchema),
    defaultValues: {
      link: "",
      customSuffix: "",
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
        setPopoverOpen(true);
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

  return (
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
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button disabled={loading} className="ml-auto w-full" type="submit">
              Shorten Link
            </Button>
          </PopoverTrigger>
          {generatedLink && (
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Your Short Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Click to copy or share on social media
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`${baseUrl}/${generatedLink.customSuffix}`}
                    readOnly
                  />
                  <Button size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  <QRCodeSVG
                    value={`${baseUrl}/${generatedLink.customSuffix}`}
                    size={128}
                  />
                </div>
                <div className="flex justify-end space-x-2">
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
            </PopoverContent>
          )}
        </Popover>
      </form>
    </Form>
  );
}
