const ProductCardSkeletonTwo = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
                <div key={index} className="rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-fit mx-auto sm:w-full sm:max-w-xs">
                    <figure className="relative h-40 sm:h-48 md:h-52 lg:h-56 xl:h-60 w-full overflow-hidden">
                        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                        <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-sm animate-pulse"></div>
                    </figure>
                    <div className="p-4 sm:p-5 bg-gray-100 relative -mt-6 rounded-t-[32px] shadow-inner text-left">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="space-y-1 mb-2">
                            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        </div>
                        <div className="mb-2 flex items-center">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-12 ml-2 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                            ))}
                            <div className="w-8 h-3 bg-gray-200 rounded ml-1 animate-pulse"></div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <div className="w-full sm:flex-1 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
                            <div className="w-full sm:flex-1 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductCardSkeletonTwo;
