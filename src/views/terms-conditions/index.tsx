import { useEffect, useState } from "react";
import apiConfig from "../../config/api.json";
import { useAPI } from "../../hooks/useApi";
import { useAtomValue } from "jotai";
import { metaDataAtom } from "../../store/global-store";
import { Helmet } from "react-helmet-async";

export interface TermsConditionsCmsData {
	id: string;
	title: string;
	description: string;
}

const TermsAndConditions = () => {
	const { fetchData } = useAPI();
	const [response, setResponse] = useState<TermsConditionsCmsData>();
	const metaData = useAtomValue(metaDataAtom);
	const TermsConditionsMeta = metaData?.find(item => item.page?.toLowerCase().includes("terms and conditions"));

	useEffect(() => {
		const fetchTermsConditionsData = async () => {
			const result = await fetchData({ apiUrl: `${apiConfig.site.termsConditionsUrl}` });
			setResponse(result[0]);
		};
		fetchTermsConditionsData();
	}, []);

	return (
		<>
			<Helmet>
				<title>
					{(TermsConditionsMeta?.metaTitle || "Terms and Conditions")
						.split(" ")
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ")}
				</title>
				<meta name="description" content={TermsConditionsMeta?.metaDescription} />
				<meta name="keywords" content={TermsConditionsMeta?.metaKeywords} />
			</Helmet>
			<div className="container max-w-screen-2xl mx-auto px-4 py-4 text-justify">
				<p className="text-3xl text-center font-bold mb-6 text-[var(--color-green-primary)]">
					{response?.title}
				</p>
				<div
					className="prose prose-base"
					dangerouslySetInnerHTML={{ __html: response?.description || "" }}
				/>
			</div>
		</>
	);
};

export default TermsAndConditions;
