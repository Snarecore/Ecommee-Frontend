import Image from "next/image";
import Link from "next/link";;

const RecentProduct = ({
	title,
	headers,
	data,
}: {
	title: string;
	headers: string[];
	data: any[];
}) => {

	return (
		<div className="bg-white p-4 rounded-lg shadow-md overflow-x-scroll cursor-pointer">
			<div className="flex justify-between p-2">
				<h2 className="text-lg font-semibold mb-4">{title}</h2>
				<Link href={"/"} className="underline text-[#212B36] text-[13px] hover:text-[var(--color-green-primary)] transition-all ease-in duration-300">View All</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full ">
					<thead>
						<tr className="">
							<th className="p-3 text-left">
								#
							</th>

							{headers.map((header, index) => (
								<th key={index} className="p-3 text-left">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, rowIndex) => (
							<tr key={rowIndex} className="border-y border-gray-200">
								<td className="p-3 text-left">
									{rowIndex + 1}
								</td>

								<td className="p-3 flex items-center gap-3">
									<Image src={row.image} alt={row.name} className="w-10 h-10 rounded-md" width={40} height={40} />
									<span>{row.name}</span>
								</td>

								<td className="p-3">{row.price}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentProduct;
