import { useEffect } from "react";
import { useAtom, useSetAtom } from 'jotai';
import { mainCategoriesAtom, isLoadingAtom, nestedCategoriesAtom, faqAtom, headerFooterAtom, socialLinksAtom, metaDataAtom, megaDiscountAtom } from '../store/global-store';
import apiConfig from "../config/api.json";
import { useAPI } from "../hooks/useApi";

export const InitialStateService = () => {
    const { fetchData } = useAPI();
    const [mainCategories, setMainCategories] = useAtom(mainCategoriesAtom);
    const setNestedCategories = useSetAtom(nestedCategoriesAtom);
    const setFaq = useSetAtom(faqAtom);
    const setHeaderFooter = useSetAtom(headerFooterAtom);
    const setSocialLinks = useSetAtom(socialLinksAtom);
    const setIsLoading = useSetAtom(isLoadingAtom);
    const setMetaData = useSetAtom(metaDataAtom);
    const setMegaDiscount = useSetAtom(megaDiscountAtom);

    useEffect(() => {
        if (mainCategories && mainCategories.length > 0) return;

        const fetchCommonData = async () => {
            setIsLoading(true);
            const response = await fetchData({ apiUrl: `${apiConfig.site.commonDataUrl}` });
            if (response) {
                setMainCategories(response?.mainCategory);
                setNestedCategories(response?.nestedCategories);
                setFaq(response?.faqData);
                setHeaderFooter(response?.headerFooterData);
                setSocialLinks(response?.socialLinkData);
                setMetaData(response?.metaData);
                setMegaDiscount(response?.megaDiscount);
            }
            setIsLoading(false);
        };

        fetchCommonData();
    }, [mainCategories, setMainCategories, setNestedCategories, setFaq, setHeaderFooter, setSocialLinks, setMetaData, setMegaDiscount, setIsLoading]);

    return null;
};