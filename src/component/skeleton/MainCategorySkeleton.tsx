const MainCategorySkeleton = () => {
    return (
        <div className="max-w-screen-2xl mx-auto px-4 py-8 my-4">
            <div className="flex items-center justify-center flex-wrap gap-6 md:gap-8">
                {[...Array(6)].map((_, index) => (
                    <div 
                        key={index} 
                        className="relative w-[200px] sm:w-[220px] md:w-[240px] h-[260px] sm:h-[290px] md:h-[320px] bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-150 dark:border-gray-700/80 animate-pulse flex flex-col justify-end"
                    >
                        {/* Simulated Bottom Overlay and Text Skeleton */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-200/50 via-transparent to-transparent dark:from-black/40"></div>
                        <div className="relative z-10 p-5 flex justify-center w-full">
                            <div className="h-5 w-28 bg-gray-250 dark:bg-gray-700 rounded-md"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainCategorySkeleton;