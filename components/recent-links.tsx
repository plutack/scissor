import { Link1Icon, ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const data = [
  { link: "www.google.com", customSuffix: "gooolslsl" },
  { link: "www.google.com", customSuffix: "gooolslsl" },
  { link: "www.google.com", customSuffix: "gooolslsl" },
  { link: "www.google.com", customSuffix: "gooolslsl" },
  { link: "www.google.com", customSuffix: "gooolslsl" },
];

export function RecentLinks() {
  return (
    <div className="space-y-8">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Link1Icon className="h-9 w-9" />
          <div className="flex-nowrap">
            <Link
              href={item.customSuffix}
              target="_blank"
              className="underline underline-offset-4 hover:text-primary"
            >
              {`$${process.env.NEXT_PUBLIC_BASE_URL}/${item.customSuffix}`} →{" "}
              {item.customSuffix}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
