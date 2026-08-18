import Image from "next/image";
import { FiEye } from "react-icons/fi";
import Link from "next/link";;
import { formatPrettyDateWithTime } from "../../utils/date-utils";
import EmptyComponent from "../empty-component";

const ProductListTable = ({
	title,
	headers,
	data,
}: {
	title: string;
	headers: string[];
	data: any[];
}) => {

	return (
		<div className="bg-white p-4 rounded-lg shadow-md">
			<div className="flex justify-between p-2">
				<p className="text-lg font-semibold mb-4">{title}</p>
				<Link href={"/products"} className="underline text-[#212B36] text-[13px] hover:text-[var(--color-green-primary)] transition-all ease-in duration-300">
					View All
				</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full min-w-[600px]">
					<thead>
						<tr>
							<th className="p-3 text-left">
								Sl
							</th>
							{headers.map((header, index) => (
								<th key={index} className="p-3 text-left">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data?.length > 0 ? (
							data.map((row, rowIndex) => (
								<tr key={rowIndex} className="border-y border-gray-200">
									<td className="p-3 text-left">
										{rowIndex + 1}
									</td>
									<td className="p-3 flex items-center gap-3">
										<Image src={row.featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={row.name} className="w-10 h-10 rounded-md" width={40} height={40} />
										<span>{row.name}</span>
									</td>
									<td className="p-3">{row.mainCategoryName}</td>
									<td className="p-3">{`$${row.price}`}</td>
									<td className="p-3">{formatPrettyDateWithTime(row.createdAt)}</td>
									<td className="p-3 flex items-center gap-3">
										<Link href={`/product-details/${row.id}`}
											className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer">
											<FiEye />
										</Link>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={6}>
									<EmptyComponent message="No products found. Start by adding your first product to your store!"/>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>

	);
};

export default ProductListTable;
