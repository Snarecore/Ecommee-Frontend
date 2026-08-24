'use client';

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AppInitializer from "../providers/AppInitializer";
import { Provider as JotaiProvider } from "jotai";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  'pk_test_51RnvzXBVnYSmQrwaX27nyzY5fVkPDmiMTAOqA7qgI5KlyF4MN7y36bkb5ny0gadpnBYnvmGCUPiN4E4x4fIeySyL00xzqFL7TF'
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false, // Prevent auto refetch when user focuses back on tab
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
