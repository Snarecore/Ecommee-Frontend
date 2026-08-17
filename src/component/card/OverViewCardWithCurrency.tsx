const OverViewCardWithCurrency = ({
	title,
	subTitle,
	children,
	bgColor = "bg-gray-100",
}: {
	title: string;
	subTitle: string;
	children: React.ReactNode;
	bgColor?: string;
}) => {
	return (
		<div className="p-5 bg-white rounded-lg flex items-center gap-4 border border-[#e6eaed] leading-tight">
			<div className={`text-md ${bgColor} rounded-full w-12 h-12 flex items-center justify-center`}>
				{children}
			</div>
			<div>
				<p className="text-lg font-bold">${title}</p>
				<p className="text-[14px] text-[#646B72]">{subTitle}</p>
			</div>
		</div>
	);
};

export default OverViewCardWithCurrency;
