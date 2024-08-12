import { Metadata } from "next";
import Link from "next/link";
import UserAuthForm from "@/components/forms/user-auth-form";
import { HomeShortenLinkForm } from "@/components/forms/home-shorten-link-form";

export const metadata: Metadata = {
  title: "Scissor - URL Shortener",
  description: "Shorten, customize, and track your URLs with Scissor.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen h-screen flex flex-col md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
          Scissor
        </div>
        <div className="relative z-20 mt-auto">
          <h2 className="text-4xl font-bold mb-4">Brief is the new black</h2>
          <p className="text-xl mb-6">
            Scissor is a powerful URL shortening tool designed to make your
            links as concise as possible.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Create short, branded URLs</li>
            <li>Generate QR codes for easy sharing</li>
            <li>Track link performance with analytics</li>
            <li>Manage your link history</li>
          </ul>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Scissor has revolutionized our marketing campaigns. The
              custom URLs and analytics features are game-changers!&rdquo;
            </p>
            <footer className="text-sm">- Marketing Director, Talut Tech</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Shorten Your URL</h2>
            <HomeShortenLinkForm />
          </div>
          <div className="w-full max-w-md">
            <div className="flex flex-col space-y-2 text-center mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign up to access advanced features like custom domains, QR
                codes, and analytics
              </p>
            </div>
            <UserAuthForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
