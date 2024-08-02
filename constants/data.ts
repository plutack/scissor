import { NavItem } from "@/types";

export type Link = {
  name: string;
  link: string;
  customSuffix: string;
  clicks: number; 
}

// export const links: Link[] = [
//   {
//     link: "https://www.google.com",
//     customSuffix: "google.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.facebook.com",
//     customSuffix: "facebook.com",
//     clickCount: 25,
//   },

//   {
//     link: "https://www.twitter.com",
//     customSuffix: "twitter.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.instagram.com",
//     customSuffix: "instagram.com",
//     clickCount: 66,
//   },
//   {
//     link: "https://www.linkedin.com",
//     customSuffix: "linkedin.com",
//     clickCount: 45,
//   },
//   {
//     link: "https://www.youtube.com",
//     customSuffix: "youtube.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.reddit.com",
//     customSuffix: "reddit.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.tiktok.com",
//     customSuffix: "tiktok.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.pinterest.com",
//     customSuffix: "pinterest.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.snapchat.com",
//     customSuffix: "snapchat.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.twitch.com",
//     customSuffix: "twitch.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.whatsapp.com",
//     customSuffix: "whatsapp.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.spotify.com",
//     customSuffix: "spotify.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.amazon.com",
//     customSuffix: "amazon.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.ebay.com",
//     customSuffix: "ebay.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.etsy.com",
//     customSuffix: "etsy.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.walmart.com",
//     customSuffix: "walmart.com",
//     clickCount: 0,
//   },
//   {
//     link: "https://www.target.com",
//     customSuffix: "target.com",
//     clickCount: 56,
//   },
// ];

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
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: "profile",
    label: "profile",
  },
];
