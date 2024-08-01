"use client";
import { useEffect, useState } from "react";
import ky from "ky";
import NotFound from "@/app/not-found";

export default function CustomSuffixPage({
  params,
}: {
  params: { customSuffix: string };
}) {
  const { customSuffix } = params;
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>("");

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const result: { success: boolean; data: string } = await ky
          .get(`/api/link/public/${customSuffix}`)
          .json();

        setRedirecting(true);
        setRedirectUrl(result.data);

        setTimeout(() => {
          const redirectTo = /^https?:\/\//i.test(result.data)
            ? result.data
            : `http://${result.data}`;
          window.location.href = redirectTo;
        }, 3000);
      } catch (error) {
        console.error(error);
        window.location.href = "/invalid-link";
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [customSuffix]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-center">
          Loading, please wait...
        </p>
      </div>
    ); // Show a loading state while fetching
  }

  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Redirecting to {redirectUrl}...</p>
      </div>
    );
  }

  return null; // The component doesn't render anything
}
