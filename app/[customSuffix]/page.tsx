"use client";
import { useEffect, useRef, useState } from "react";
import ky from "ky";

// Custom hook for managing the link redirection logic
function useLinkRedirect(customSuffix: string) {
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>("");
  const apiCalledRef = useRef(false);

  useEffect(() => {
    const fetchLinkAndTrackClick = async () => {
      if (apiCalledRef.current) return;
      apiCalledRef.current = true;

      try {
        // Fetch the link
        const result: { success: boolean; data: string } = await ky
          .get(`/api/link/public/${customSuffix}`)
          .json();
        console.log("result", result);
        setRedirectUrl(result.data);
        setRedirecting(true);

        // Track the click
        const country = await fetchCountry();
        await ky.patch("/api/link/click", {
          json: {
            customSuffix,
            country,
          },
        });

        // Prepare the redirect URL
        const redirectTo = /^https?:\/\//i.test(result.data)
          ? result.data
          : `http://${result.data}`;

        // Set a timeout to allow for a brief display of the redirecting message
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 2000);
      } catch (error) {
        console.error(error);
        window.location.href = "/invalid-link";
      } finally {
        setLoading(false);
      }
    };

    fetchLinkAndTrackClick();
  }, [customSuffix]);

  return { loading, redirecting, redirectUrl };
}

// Helper function to fetch the user's country
const fetchCountry = async (): Promise<string> => {
  try {
    const response: { country_name: string } = await ky
      .get("https://ipapi.co/json/")
      .json();
    return response.country_name;
  } catch (error) {
    console.error("Error fetching country:", error);
    return "Unknown";
  }
};

export default function CustomSuffixPage({
  params,
}: {
  params: { customSuffix: string };
}) {
  const { customSuffix } = params;
  const { loading, redirecting, redirectUrl } = useLinkRedirect(customSuffix);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-center">
          Loading, please wait...
        </p>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Redirecting to {redirectUrl}...</p>
      </div>
    );
  }

  return null;
}
