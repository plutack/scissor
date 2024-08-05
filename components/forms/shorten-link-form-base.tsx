import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { shortenLinkSchema as shortenLinkSchemaBase } from "@/schemas";

type ShortenLinkFormBaseProps = {
  onSuccess: (data: any) => void;
  isProtectedRoute?: boolean;
};

export function ShortenLinkFormBase({
  onSuccess,
  isProtectedRoute = false,
}: ShortenLinkFormBaseProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const schema = isProtectedRoute
    ? shortenLinkSchemaBase
    : shortenLinkSchemaBase.omit({ customSuffix: true, name: true });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      link: "",
      customSuffix: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {isProtectedRoute && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Link name"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
        {isProtectedRoute && (
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
        )}
        <Button disabled={loading} className="w-full" type="submit">
          Shorten Link
        </Button>
      </form>
    </Form>
  );
}
