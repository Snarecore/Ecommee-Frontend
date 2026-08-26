'use client';

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppInitializer from "../providers/AppInitializer";
import { Provider as JotaiProvider } from "jotai";

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
        <AppInitializer />
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#F6F6F6] text-primary font-semibold">Loading...</div>}>
          {children}
        </React.Suspense>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom"
            buttonPosition="bottom-left"
          />
        )}
      </QueryClientProvider>
    </JotaiProvider>
  );
}
