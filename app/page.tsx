// app/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { DashBoard } from "@/components/dashboard";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  while (status !== "authenticated") {
    return <div className="bg-slate-500"></div>;
  }

  return (
    <>
      {!session ? (
        <main className="flex flex-col h-full justify-center items-center bg-gradient-to-b from-sky-400 to-blue-800">
          <div className="space-y-6 text-center">
            <h1 className="text-6xl font-semibold text-white drop-shadow-md">
              EVENTFUL
            </h1>
            <div>
              <LoginButton>
                <Button size="lg">Sign In</Button>
              </LoginButton>
            </div>
          </div>
        </main>
      ) : (
        <DashBoard />
      )}
    </>
  );
}
