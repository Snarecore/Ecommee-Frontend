'use client';
import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useApi";
import { sanitizeHTML } from "../../utils/sanitize-utils";

export interface PolicyCmsData {
	id?: string;
	title?: string;
	description?: string;
}

interface PolicyViewProps {
	apiUrl: string;
}

const PolicyView = ({ apiUrl }: PolicyViewProps) => {
	const { fetchData } = useAPI();
	const [response, setResponse] = useState<PolicyCmsData>();

	useEffect(() => {
		const fetchPolicyData = async () => {
			if (!apiUrl) return;
			const result = await fetchData({ apiUrl });
			if (Array.isArray(result)) {
				setResponse(result[0]);
			} else {
				setResponse(result);
			}
		};
		fetchPolicyData();
	}, [apiUrl]);

	return (
		<div className="container max-w-screen-2xl mx-auto px-4 py-4 text-justify">
			{response?.title && (
				<p className="text-3xl text-center font-bold mb-6 text-[var(--color-green-primary)]">
					{response.title}
				</p>
			)}
			<div
				className="dangerous-html"
				dangerouslySetInnerHTML={{ __html: sanitizeHTML(response?.description) }}
			/>
		</div>
	);
};

export default PolicyView;
