"use client"
import { useEffect, useState } from 'react';
import ky from 'ky';
import { notFound } from 'next/navigation';

export default function CustomSuffixPage({ params }: { params: { customSuffix: string } }) {
  const { customSuffix } = params;
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const result: { success: boolean; data: string } = await ky.get(`/api/link/public/${customSuffix}`).json();

        setRedirecting(true);
        setRedirectUrl(result.data); // result.data is guaranteed to be a string here

        setTimeout(() => {
          // Always assume result.data is valid, directly use it for redirection
          const redirectTo = /^https?:\/\//i.test(result.data) ? result.data : `http://${result.data}`; // Add http if necessary

          window.location.href = redirectTo; // Redirect to the link after 3 seconds
        }, 3000);
      } catch (error) {
        console.error(error); // Log the error for debugging
        notFound(); // Handle any unexpected errors by rendering the 404 page
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [customSuffix]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-center">Loading, please wait...</p>
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
