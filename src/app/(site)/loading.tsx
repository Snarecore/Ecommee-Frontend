export default function Loading() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* Banner / Header Skeleton */}
      <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-2xl mb-8"></div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
