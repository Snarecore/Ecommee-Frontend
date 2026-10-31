'use client';

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

                // Dynamically apply database theme globally to the customer storefront
                if (response?.headerFooterData && typeof window !== "undefined") {
                    const hf = response.headerFooterData;
                    const primary = hf.primaryColor || (hf.themeConfig && hf.themeConfig.primaryColor);
                    const secondary = hf.secondaryColor || (hf.themeConfig && hf.themeConfig.secondaryColor);
                    if (primary) {
                        document.documentElement.style.setProperty('--color-primary', primary);
                        document.documentElement.style.setProperty('--color-green-primary', primary);
                        try { localStorage.setItem('storefront-primary-color', primary); } catch {}
                    }
                    if (secondary) {
                        document.documentElement.style.setProperty('--color-green-secondary', secondary);
                    }
                    if (hf.themeConfig?.backgroundTone) {
                        document.documentElement.style.setProperty('--color-white-primary', hf.themeConfig.backgroundTone);
                    }
                    if (hf.themeConfig) {
                        try { localStorage.setItem('storefront-theme', JSON.stringify(hf.themeConfig)); } catch {}
                    }
                }
            }
            setIsLoading(false);
        };

        fetchCommonData();
    }, [mainCategories, setMainCategories, setNestedCategories, setFaq, setHeaderFooter, setSocialLinks, setMetaData, setMegaDiscount, setIsLoading]);

    return null;
};