import { NavItem } from "@/types";

export type Link = {
  name: string;
  link: string;
  customSuffix: string;
  clicks: number;
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Link",
    href: "/dashboard/link",
    icon: "link",
    label: "link",
  },
];

export const reservedSuffixes = [
  "dashboard",
  "link",
  "profile",
  "login",
  "logout",
  "signup",
  "api-docs",
  "auth",
  "auth-callback",
  "api",
];
