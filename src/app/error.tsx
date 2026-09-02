'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If a chunk fails to load (e.g. stale HMR cache or post-deployment chunk hash mismatch),
    // automatically hard reload the browser to get the latest chunk assets.
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[var(--color-green-primary,#218DAE)] text-white font-medium rounded-md hover:opacity-90 transition-opacity cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
