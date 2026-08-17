
const OrderListSkeleton = () => {
	return (
		<div className="mt-6">
			<p className="font-bold text-xl text-[var(--color-green-primary)]">
				Order Lists
			</p>

			<div className="mt-6 grid gap-3">
				{Array.from({ length: 5 }).map((_, index) => (
					<div
						key={index}
						className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
					>
						<div className="flex flex-col md:flex-row justify-between gap-3">
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<div className="h-4 w-20 bg-gray-200 rounded"></div>
									<div className="h-4 w-32 bg-gray-300 rounded"></div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-4 w-12 bg-gray-200 rounded"></div>
									<div className="h-4 w-28 bg-gray-300 rounded"></div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
								<div className="flex items-center gap-2">
									<div className="h-4 w-16 bg-gray-200 rounded"></div>
									<div className="h-4 w-20 bg-gray-300 rounded"></div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-4 w-16 bg-gray-200 rounded"></div>
									<div className="h-6 w-20 bg-gray-300 rounded-full"></div>
								</div>
								<div className="h-10 w-full sm:w-32 bg-gray-300 rounded-lg"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default OrderListSkeleton;
