import { useEffect } from "react";
import { useSetAtom } from 'jotai';
import { mainCategoriesAtom, isLoadingAtom, nestedCategoriesAtom, faqAtom, headerFooterAtom, socialLinksAtom, metaDataAtom } from '../store/global-store';
import apiConfig from "../config/api.json";
import { useAPI } from "../hooks/useApi";

export const InitialStateService = () => {
    const { fetchData } = useAPI();
    const setMainCategories = useSetAtom(mainCategoriesAtom);
    const setNestedCategories = useSetAtom(nestedCategoriesAtom);
    const setFaq = useSetAtom(faqAtom);
    const setHeaderFooter = useSetAtom(headerFooterAtom);
    const setSocialLinks = useSetAtom(socialLinksAtom);
    const setIsLoading = useSetAtom(isLoadingAtom);
    const setMetaData = useSetAtom(metaDataAtom)

    useEffect(() => {
        const fetchCommonData = async () => {
            setIsLoading(true);
            const response = await fetchData({ apiUrl: `${apiConfig.site.commonDataUrl}` });
            setMainCategories(response?.mainCategory);
            setNestedCategories(response?.nestedCategories);
            setFaq(response?.faqData);
            setHeaderFooter(response?.headerFooterData);
            setSocialLinks(response?.socialLinkData);
            setMetaData(response?.metaData);
            setIsLoading(false);
        };

        fetchCommonData();
    }, [setMainCategories, setNestedCategories, setFaq, setHeaderFooter, setSocialLinks, setMetaData]);

    return null;
};