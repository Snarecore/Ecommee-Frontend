const TableSkeleton = () => {
	return (
		<div className="animate-pulse">
			<div className="w-full overflow-x-auto bg-white p-4">
				<table className="w-full text-left border-collapse min-w-[1000px]">
					<thead className="bg-white">
						<tr>
							<th className="p-3 w-10">
								<div className="h-4 w-4 bg-gray-200 rounded"></div>
							</th>
							{[...Array(4)].map((_, i) => (
								<th key={i} className="p-3">
									<div className="h-4 w-24 bg-gray-200 rounded"></div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{[...Array(10)].map((_, rowIndex) => (
							<tr key={rowIndex} className="border-b border-gray-100">
								<td className="p-3">
									<div className="h-4 w-4 bg-gray-200 rounded"></div>
								</td>
								<td className="p-3">
									<div className="flex items-center gap-2">
										<div className="h-8 w-8 bg-gray-200 rounded"></div>
										<div className="h-4 w-24 bg-gray-200 rounded"></div>
									</div>
								</td>
								<td className="p-3">
									<div className="h-4 w-28 bg-gray-200 rounded"></div>
								</td>
								<td className="p-3">
									<div className="h-6 w-16 bg-gray-200 rounded-md"></div>
								</td>
								<td className="p-3">
									<div className="flex gap-2">
										<div className="h-8 w-8 bg-gray-200 rounded"></div>
										<div className="h-8 w-8 bg-gray-200 rounded"></div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default TableSkeleton;