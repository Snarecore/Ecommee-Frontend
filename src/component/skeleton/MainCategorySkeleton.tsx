const MainCategorySkeleton = () => {
    return (
        <div className="max-w-screen-2xl mx-auto px-4 py-4 my-4">
            <div className="flex items-center justify-center flex-wrap gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-[150px] w-[220px] p-1.5 md:p-3 bg-white rounded-2xl shadow-sm transform transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col items-center justify-center">
                        <div className="p-4 rounded-xl">
                            <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-24 mt-2 animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainCategorySkeleton;