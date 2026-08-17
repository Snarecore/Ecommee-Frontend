const HeaderFooterCmsSkeleton = () => {
	return (
		<div className="animate-pulse bg-white rounded-lg border border-gray-200 p-6">
			<div className="mb-8">
				<div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
				<div className="flex items-center gap-4">
					<div className="w-[120px] h-[120px] bg-gray-200 rounded-md"></div>
					<div className="w-[120px] h-[120px] bg-gray-200 rounded-md"></div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				<div>
					<div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
					<div className="h-10 w-full bg-gray-200 rounded"></div>
				</div>

				<div>
					<div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
					<div className="h-10 w-full bg-gray-200 rounded"></div>
				</div>

				<div>
					<div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
					<div className="h-10 w-full bg-gray-200 rounded"></div>
				</div>

				<div>
					<div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
					<div className="h-10 w-full bg-gray-200 rounded"></div>
				</div>
			</div>

			<div className="mb-8">
				<div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
				<div className="flex items-center gap-4">
					<div className="w-[120px] h-[120px] bg-gray-200 rounded-md"></div>
					<div className="w-[120px] h-[120px] bg-gray-200 rounded-md"></div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 mb-8">
				<div>
					<div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
					<div className="h-24 w-full bg-gray-200 rounded"></div>
				</div>
				<div>
					<div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
					<div className="h-10 w-full bg-gray-200 rounded"></div>
				</div>
			</div>

			<div className="flex justify-end gap-3">
				<div className="h-10 w-20 bg-gray-200 rounded"></div>
				<div className="h-10 w-20 bg-gray-200 rounded"></div>
			</div>
		</div>
	);
};

export default HeaderFooterCmsSkeleton;