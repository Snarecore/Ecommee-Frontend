'use client';

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AppInitializer from "../providers/AppInitializer";
import { Provider as JotaiProvider } from "jotai";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Always consider query data stale so fresh data is fetched on navigation
            refetchOnWindowFocus: true, // Auto refetch when user focuses back on the tab
            refetchOnMount: true, // Auto refetch when component mounts
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <Elements stripe={stripePromise}>
          <AppInitializer />
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#F6F6F6] text-primary font-semibold">Loading...</div>}>
            {children}
          </React.Suspense>
        </Elements>
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-left"
        />
      </QueryClientProvider>
    </JotaiProvider>
  );
}
