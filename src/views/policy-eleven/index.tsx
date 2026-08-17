import { useEffect, useState } from "react";
import apiConfig from "../../config/api.json";
import { useAPI } from "../../hooks/useApi";
import { metaDataAtom } from "../../store/global-store";
import { useAtomValue } from "jotai";
import { Helmet } from "react-helmet-async";

export interface PrivacyPolicyCmsData {
	id: string;
	title: string;
	description: string;
}

const PolicyEleven = () => {
	const { fetchData } = useAPI();
	const [response, setResponse] = useState<PrivacyPolicyCmsData>();
	const metaData = useAtomValue(metaDataAtom);
	const privacyPolicyMeta = metaData?.find(item => item.page?.toLowerCase().includes("privacy"));

	useEffect(() => {
		const fetchPrivacyPolicyData = async () => {
			const result = await fetchData({ apiUrl: `${apiConfig.site.policyElevenUrl}` });
			setResponse(result);
		};
		fetchPrivacyPolicyData();
	}, []);

	return (
		<>
			<Helmet>
				<title>
					{privacyPolicyMeta?.metaTitle
						?.split(" ")
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ")}
				</title>
				<meta name="description" content={privacyPolicyMeta?.metaDescription} />
				<meta name="keywords" content={privacyPolicyMeta?.metaKeywords} />
			</Helmet>
			<div className="container max-w-screen-2xl mx-auto px-4 py-4 text-justify">
				<p className="text-3xl text-center font-bold mb-6 text-[var(--color-green-primary)]">
					{response?.title}
				</p>
				<div className="dangerous-html"
					dangerouslySetInnerHTML={{ __html: response?.description || "" }}
				/>
			</div>
		</>
	);
};

export default PolicyEleven;
