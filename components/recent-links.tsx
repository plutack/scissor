// components/recent-links.tsx
"use client";

import React from "react";
import { Link1Icon, ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface LinkData {
  link: string;
  customSuffix: string;
}

interface RecentLinksProps {
  links: LinkData[];
}

export function RecentLinks({ links }: RecentLinksProps) {
  return (
    <div className="space-y-4">
      {links.map((item, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Link1Icon className="h-6 w-6" />
          <div className="flex-1 min-w-0">
            <Link
              href={`/${item.customSuffix}`}
              target="_blank"
              className="text-sm font-medium truncate block hover:underline"
            >
              {`${process.env.NEXT_PUBLIC_BASE_URL}/${item.customSuffix}`}
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {item.link}
            </p>
          </div>
          <ArrowRightIcon className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
}
