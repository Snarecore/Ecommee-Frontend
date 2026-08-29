'use client';
import { useEffect, useState } from "react";
import apiConfig from "../../config/api.json";
import { useAPI } from "../../hooks/useApi";
import { metaDataAtom } from "../../store/global-store";
import { useAtomValue } from "jotai";
import { sanitizeHTML } from "../../utils/sanitize-utils";

export interface ExchangePolicyCmsData {
  id: string;
  title: string;
  description: string;
}

const ExchangePolicy = () => {
  const { fetchData } = useAPI();
  const [response, setResponse] = useState<ExchangePolicyCmsData>();
  const metaData = useAtomValue(metaDataAtom);
  const exchangePolicyMeta = metaData?.find(item => item.page?.toLowerCase().includes("exchange"));

  useEffect(() => {
    const fetchContactPageData = async () => {
      const result = await fetchData({ apiUrl: `${apiConfig.site.exchangeReturnUrl}` });
      setResponse(result[0]);
    };
    fetchContactPageData();
  }, []);

  return (
    <>
            <div className="container max-w-screen-2xl mx-auto px-4 py-4 text-justify">
        <p className="text-3xl text-center font-bold mb-6 text-[var(--color-green-primary)]">
          {response?.title}
        </p>
        <div className="dangerous-html"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(response?.description) }}
        />

      </div>
    </>
  );
};

export default ExchangePolicy;
