const ProductCategorySkeleton = () => {
    return (
        <div className="w-68 bg-gradient-to-b from-gray-100 to-gray-300 border-l border-gray-300 shadow-lg h-full overflow-y-auto sticky top-0">
            <div className="px-6 py-4 border-b border-gray-300">
                <div className="h-6 w-32 bg-gray-400 rounded animate-pulse mx-auto"></div>
            </div>
            <nav className="mt-2">
                <div className="pb-2 px-4">
                    <div className="h-5 w-28 bg-gray-400 rounded animate-pulse"></div>
                </div>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="h-5 w-24 bg-gray-400 rounded animate-pulse"></div>
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-4 bg-gray-400 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default ProductCategorySkeleton;
