const SkeletonBox = ({ height = "h-6", width = "w-full", className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${height} ${width} ${className}`}></div>
);

const SalesDashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[120px] animate-pulse"
            >
              <div className="flex justify-between items-center">
                <SkeletonBox height="h-10" width="w-10" className="rounded-full" />
                <SkeletonBox height="h-6" width="w-16" />
              </div>
              <SkeletonBox height="h-6" width="w-2/3" className="mt-4" />
              <SkeletonBox height="h-4" width="w-1/2" className="mt-2" />
            </div>
          ))}
      </div>

      {/* Charts & Subscription */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse min-h-[300px]">
          <SkeletonBox height="h-6" width="w-1/3" className="mb-4" />
          <SkeletonBox height="h-64" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
          <div className="flex items-center mb-6 gap-3">
            <SkeletonBox height="h-10" width="w-10" className="rounded-full" />
            <SkeletonBox height="h-6" width="w-1/4" />
          </div>

          <SkeletonBox height="h-4" width="w-1/4" className="mb-2" />
          <SkeletonBox height="h-6" width="w-2/3" className="mb-4" />

          {/* Payout Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center bg-gray-100 rounded-xl p-6 shadow-sm w-full animate-pulse"
                >
                  <SkeletonBox height="h-10" width="w-10" className="rounded-full mb-2" />
                  <SkeletonBox height="h-6" width="w-2/3" className="mb-1" />
                  <SkeletonBox height="h-4" width="w-1/2" />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm animate-pulse">
          <SkeletonBox height="h-6" width="w-1/3" className="mb-4" />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <SkeletonBox key={i} height="h-4" width="w-full" className="mb-2" />
            ))}
        </div>

        <div className="bg-white px-8 py-6 rounded-xl shadow-sm animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <SkeletonBox height="h-10" width="w-10" className="rounded-full" />
            <SkeletonBox height="h-6" width="w-1/3" />
          </div>
          <SkeletonBox height="h-64" />
        </div>
      </div>
    </div>
  );
};

export default SalesDashboardSkeleton;
