const ProductDetailsSkeleton = () => {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-12">
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="w-full h-[400px] bg-gray-300 rounded-lg" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-md" />
              ))}
            </div>
          </div>
  
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4" />
            <div className="h-8 bg-gray-300 rounded w-1/4" />
            <div className="flex gap-4 mt-4">
              <div className="h-10 w-28 bg-gray-300 rounded" />
              <div className="h-10 w-28 bg-gray-300 rounded" />
            </div>
            <div className="h-5 w-40 bg-gray-300 rounded mt-2" />
            <div className="space-y-2 mt-4">
              <div className="h-6 w-40 bg-gray-300 rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
  
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-white p-4 mt-10">
          <div className="w-full lg:w-3/4 space-y-4">
            <div className="flex gap-4 border-b pb-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-24 bg-gray-300 rounded" />
              ))}
            </div>
            <div className="space-y-3 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>
  
          <div className="hidden lg:block w-full lg:w-1/4 space-y-4">
            <div className="h-40 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  };
  
  export default ProductDetailsSkeleton;
  